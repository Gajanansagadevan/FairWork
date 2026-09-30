import { useEffect, useState } from "react";

function Leave() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [showLeaveForm, setShowLeaveForm] = useState(false);
    const [viewLeave, setViewLeave] = useState(null);
    const [replacementModal, setReplacementModal] = useState(null);
    const [replacementLoading, setReplacementLoading] = useState(false);
    const [newLeave, setNewLeave] = useState({
  employeeId: "",
  leaveType: "",
  fromDate: "",
  toDate: "",
  reason: "",
});

const todayDate = new Date().toISOString().split("T")[0];
    

    const [leaveRequests, setLeaveRequests] = useState([]);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
  fetch("https://fairwork-2h17s2be.b4a.run/api/employees")
    .then((response) => response.json())
    .then((data) => {
      setEmployees(data);
    })
    .catch((error) => {
      console.error(
        "Error fetching employees for leave:",
        error
      );
    });
}, []);

    useEffect(() => {
  fetch("https://fairwork-2h17s2be.b4a.run/api/leaves")
    .then((response) => response.json())
    .then((data) => {
  setLeaveRequests(
    data.map((leave) => ({
      id: leave.id,
      employeeId: leave.employeeId,
      name: leave.employeeName,
      department: leave.department,
      leaveType: leave.leaveType,
      fromDate: leave.startDate,
      toDate: leave.endDate,
      days: leave.days,
      reason: leave.reason,
      status: leave.status,
    }))
  );
})
    .catch((error) => {
      console.error("Error fetching leave requests:", error);
    });
}, []);

useEffect(() => {
  localStorage.setItem(
    "leaveRequests",
    JSON.stringify(leaveRequests)
  );
}, [leaveRequests]);

    const handleLeaveStatus = (id, newStatus) => {
  const request = leaveRequests.find(
    (leave) => leave.id === id
  );

  if (!request) {
    return;
  }

  const updatedLeave = {
    employeeId: request.employeeId,
    employeeName: request.name,
    department: request.department,
    leaveType: request.leaveType,
    startDate: request.fromDate,
    endDate: request.toDate,
    days: request.days,
    reason: request.reason,
    status: newStatus,
  };

  fetch(`https://fairwork-2h17s2be.b4a.run/api/leaves/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedLeave),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update leave status");
      }

      return response.json();
    })
    .then(() => {
  setLeaveRequests((prevRequests) =>
    prevRequests.map((leave) =>
      leave.id === id
        ? { ...leave, status: newStatus }
        : leave
    )
  );

  if (newStatus === "Approved") {
    findAffectedSchedules({
      ...request,
      status: "Approved",
    });
  }
})
    .catch((error) => {
      console.error("Error updating leave status:", error);
      alert("Failed to update leave status.");
    });
};

const findAffectedSchedules = async (leave) => {
  try {
    setReplacementLoading(true);

    const response = await fetch(
      "https://fairwork-2h17s2be.b4a.run/api/ai-schedules"
    );

    if (!response.ok) {
      throw new Error("Failed to load AI schedules");
    }

    const schedules = await response.json();

    const affected = schedules.filter((schedule) => {
      return (
        schedule.employeeId === leave.employeeId &&
        schedule.date >= leave.fromDate &&
        schedule.date <= leave.toDate &&
        schedule.shift?.toUpperCase() !== "OFF"
      );
    });

    if (affected.length === 0) {
      alert(
        "Leave approved. No saved working schedule is affected."
      );
      return;
    }

    const recommendations = [];

    for (const schedule of affected) {
      try {
        const recommendResponse = await fetch(
          `https://fairwork-2h17s2be.b4a.run/api/ai/recommend-replacement?scheduleId=${schedule.id}`,
          {
            method: "POST",
          }
        );

        if (!recommendResponse.ok) {
          const message = await recommendResponse.text();

          recommendations.push({
            scheduleId: schedule.id,
            date: schedule.date,
            shift: schedule.shift,
            unavailable: true,
            message:
              message ||
              "No available replacement employee found",
          });

          continue;
        }

        const recommendation =
          await recommendResponse.json();

        recommendations.push({
          ...recommendation,
          unavailable: false,
        });
      } catch (error) {
        recommendations.push({
          scheduleId: schedule.id,
          date: schedule.date,
          shift: schedule.shift,
          unavailable: true,
          message: "Unable to generate replacement",
        });
      }
    }

    setReplacementModal({
      leave,
      recommendations,
    });
  } catch (error) {
    console.error(
      "Replacement check failed:",
      error
    );

    alert(
      "Leave approved, but replacement check failed."
    );
  } finally {
    setReplacementLoading(false);
  }
};


const handleConfirmReplacement = async (
  recommendation
) => {
  const confirmReplace = window.confirm(
    `Replace ${recommendation.absentEmployeeName} with ${recommendation.replacementEmployeeName} on ${recommendation.date}?`
  );

  if (!confirmReplace) {
    return;
  }

  try {
    const response = await fetch(
      `https://fairwork-2h17s2be.b4a.run/api/ai/confirm-replacement?scheduleId=${recommendation.scheduleId}&replacementEmployeeId=${recommendation.replacementEmployeeId}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(
        message || "Failed to confirm replacement"
      );
    }

    alert("AI replacement confirmed successfully.");

    setReplacementModal((current) => {
      if (!current) {
        return null;
      }

      const remaining =
        current.recommendations.filter(
          (item) =>
            item.scheduleId !==
            recommendation.scheduleId
        );

      if (remaining.length === 0) {
        return null;
      }

      return {
        ...current,
        recommendations: remaining,
      };
    });
  } catch (error) {
    console.error(
      "Confirm replacement failed:",
      error
    );

    alert(error.message);
  }
};

const handleCancelLeave = (id) => {
  const confirmCancel = window.confirm(
    "Are you sure you want to cancel this leave request?"
  );

  if (!confirmCancel) {
    return;
  }

  fetch(`https://fairwork-2h17s2be.b4a.run/api/leaves/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to cancel leave request");
      }

      setLeaveRequests((prevRequests) =>
        prevRequests.filter(
          (request) => request.id !== id
        )
      );
    })
    .catch((error) => {
      console.error("Error cancelling leave:", error);
      alert("Failed to cancel leave request.");
    });
};

const getRemainingLeave = (employeeId, leaveType) => {
  const leaveLimits = {
    "Annual Leave": 7,
    "Casual Leave": 5,
    "Sick Leave": 3,
  };

  const selectedDate = newLeave.fromDate
    ? new Date(newLeave.fromDate)
    : new Date();

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();

  const usedDays = leaveRequests
    .filter((request) => {
      const requestDate = new Date(request.fromDate);

      const samePeriod =
        leaveType === "Annual Leave"
          ? requestDate.getFullYear() === selectedYear &&
            requestDate.getMonth() === selectedMonth
          : requestDate.getFullYear() === selectedYear;

      return (
        request.employeeId === employeeId &&
        request.leaveType === leaveType &&
        request.status !== "Rejected" &&
        samePeriod
      );
    })
    .reduce(
      (total, request) => total + request.days,
      0
    );

  return Math.max(
    0,
    leaveLimits[leaveType] - usedDays
  );
};

const getRequestedDays = () => {
  if (!newLeave.fromDate || !newLeave.toDate) {
    return 0;
  }

  const from = new Date(newLeave.fromDate);
  const to = new Date(newLeave.toDate);

  if (to < from) {
    return 0;
  }

  return Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
};

const isLeaveLimitExceeded = () => {
  if (
    !newLeave.employeeId ||
    !newLeave.leaveType ||
    !newLeave.fromDate ||
    !newLeave.toDate
  ) {
    return false;
  }

  const requestedDays = getRequestedDays();
  const remainingDays = getRemainingLeave(
    newLeave.employeeId,
    newLeave.leaveType
  );

  return requestedDays > remainingDays;
};

const hasLiveOverlap = () => {
  if (
    !newLeave.employeeId ||
    !newLeave.fromDate ||
    !newLeave.toDate
  ) {
    return false;
  }

  const from = new Date(newLeave.fromDate);
  const to = new Date(newLeave.toDate);

  return leaveRequests.some((request) => {
    if (request.employeeId !== newLeave.employeeId) {
      return false;
    }

    if (request.status === "Rejected") {
      return false;
    }

    const existingFrom = new Date(request.fromDate);
    const existingTo = new Date(request.toDate);

    return from <= existingTo && to >= existingFrom;
  });
};

const handleAddLeaveRequest = () => {
  if (
    !newLeave.employeeId ||
    !newLeave.leaveType ||
    !newLeave.fromDate ||
    !newLeave.toDate ||
    !newLeave.reason.trim()
  ) {
    alert("Please fill all required fields.");
    return;
  }

  const employee = employees.find(
  (employee) => employee.id === newLeave.employeeId
);

if (!employee) {
  alert("Employee not found.");
  return;
}

  const from = new Date(newLeave.fromDate);
  const to = new Date(newLeave.toDate);

  const today = new Date();
today.setHours(0, 0, 0, 0);

if (from < today) {
  alert("You cannot request leave for a past date.");
  return;
}

  if (to < from) {
  alert("To Date cannot be before From Date.");
  return;
}

const hasOverlappingLeave = leaveRequests.some((request) => {
  if (request.employeeId !== newLeave.employeeId) {
    return false;
  }

  if (request.status === "Rejected") {
    return false;
  }

  const existingFrom = new Date(request.fromDate);
  const existingTo = new Date(request.toDate);

  return from <= existingTo && to >= existingFrom;
  
});

if (hasOverlappingLeave) {
  alert("This employee already has a leave request for the selected dates.");
  return;
}

  const days =
    Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

    const leaveLimits = {
  "Annual Leave": 7,
  "Casual Leave": 5,
  "Sick Leave": 3,
};

const leaveLimit = leaveLimits[newLeave.leaveType];

const usedLeaveDays = leaveRequests
  .filter((request) => {
    const requestDate = new Date(request.fromDate);
    const selectedDate = new Date(newLeave.fromDate);

    const samePeriod =
      newLeave.leaveType === "Annual Leave"
        ? requestDate.getFullYear() ===
            selectedDate.getFullYear() &&
          requestDate.getMonth() ===
            selectedDate.getMonth()
        : requestDate.getFullYear() ===
            selectedDate.getFullYear();

    return (
      request.employeeId === newLeave.employeeId &&
      request.leaveType === newLeave.leaveType &&
      request.status !== "Rejected" &&
      samePeriod
    );
  })
  .reduce(
    (total, request) => total + request.days,
    0
  );
  

if (usedLeaveDays + days > leaveLimit) {
  alert(
    `Leave limit exceeded. Maximum ${leaveLimit} days allowed for ${newLeave.leaveType}.`
  );
  return;
}

  const newRequest = {
    employeeId: newLeave.employeeId,
    name: employee.name,
    department: employee.department,
    leaveType: newLeave.leaveType,
    fromDate: newLeave.fromDate,
    toDate: newLeave.toDate,
    days,
    reason: newLeave.reason,
    status: "Pending",
  };

  fetch("https://fairwork-2h17s2be.b4a.run/api/leaves", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    employeeId: newRequest.employeeId,
    employeeName: newRequest.name,
    department: newRequest.department,
    leaveType: newRequest.leaveType,
    startDate: newRequest.fromDate,
    endDate: newRequest.toDate,
    days: newRequest.days,
    reason: newRequest.reason,
    status: newRequest.status,
  }),
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to create leave request");
    }

    return response.json();
  })
  .then((savedLeave) => {
    setLeaveRequests((prevRequests) => [
      ...prevRequests,
      {
        id: savedLeave.id,
        employeeId: savedLeave.employeeId,
        name: savedLeave.employeeName,
        department: savedLeave.department,
        leaveType: savedLeave.leaveType,
        fromDate: savedLeave.startDate,
        toDate: savedLeave.endDate,
        days: savedLeave.days,
        reason: savedLeave.reason,
        status: savedLeave.status,
      },
    ]);
  })
  .catch((error) => {
    console.error("Error creating leave request:", error);
    alert("Failed to create leave request.");
  });

  setNewLeave({
    employeeId: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  setShowLeaveForm(false);
};

const filteredLeaveRequests = leaveRequests.filter((request) => {
  const matchesSearch =
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesStatus =
    statusFilter === "All" ||
    request.status === statusFilter;

  const matchesDepartment =
    departmentFilter === "All" ||
    request.department === departmentFilter;

  return matchesSearch && matchesStatus && matchesDepartment;
});

const exportLeaveCSV = () => {
  if (filteredLeaveRequests.length === 0) {
    alert("No leave requests to export.");
    return;
  }

  const headers = [
    "Employee ID",
    "Employee Name",
    "Department",
    "Leave Type",
    "From Date",
    "To Date",
    "Days",
    "Status",
    "Reason",
  ];

  const rows = filteredLeaveRequests.map((request) => [
    request.employeeId,
    request.name,
    request.department,
    request.leaveType,
    request.fromDate,
    request.toDate,
    request.days,
    request.status,
    request.reason || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "leave-report.csv");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};


    const totalRequests = leaveRequests.length;

    const pendingRequests = leaveRequests.filter(
        (request) => request.status === "Pending"
    ).length;

    const approvedRequests = leaveRequests.filter(
        (request) => request.status === "Approved"
    ).length;

    const rejectedRequests = leaveRequests.filter(
        (request) => request.status === "Rejected"
    ).length;

    const approvedLeaveDays = leaveRequests
  .filter((request) => request.status === "Approved")
  .reduce((total, request) => total + request.days, 0);

    return(
        <div className="leave-page">
            <div className="leave-header">

                 <div>
                <h1>Leave Management</h1>
                <p>Manage employee leave requests and approvals</p>
                 </div>

                 <button
  className="action-button"
  onClick={() => {
    setNewLeave({
      employeeId: "",
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });

    setShowLeaveForm(true);
  }}
>
  + New Leave Request
</button>

                </div>

                <div className="leave-stats-grid">
                    <div className="stat-card">
                        <div>
                            <p>Total Requests</p>
                            <h2>{totalRequests}</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div>
                            <p>Pending Requests</p>
                            <h2>{pendingRequests}</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div>
                            <p>Approved Requests</p>
                            <h2>{approvedRequests}</h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div>
                            <p>Rejected</p>
                            <h2>{rejectedRequests}</h2>
                        </div>
                    </div>

                    <div className="stat-card">
  <div>
    <p>Approved Leave Days</p>
    <h2>{approvedLeaveDays}</h2>
  </div>
</div>

                    </div>

                    <div className="section-title">
  <h2>Leave Requests</h2>
  <p>View and manage employee leave requests</p>
</div>

<button
  className="action-button"
  onClick={exportLeaveCSV}
>
  Export Leave Report
</button>

<input
  type="text"
  placeholder="Search employee..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="All">All Status</option>
  <option value="Pending">Pending</option>
  <option value="Approved">Approved</option>
  <option value="Rejected">Rejected</option>
</select>

<select
  value={departmentFilter}
  onChange={(e) => setDepartmentFilter(e.target.value)}
>
  <option value="All">All Departments</option>
  <option value="Dry">Dry</option>
  <option value="Meat">Meat</option>
  <option value="Bakery">Bakery</option>
  <option value="Production Bakery">Production Bakery</option>
  <option value="Liquor">Liquor</option>
  <option value="Admin">Admin</option>
  <option value="Cashier">Cashier</option>
  <option value="Vegetable">Vegetable</option>
  <option value="Pharmacy">Pharmacy</option>
  <option value="Food">Food</option>
</select>

<div className="employee-table-container">
  <table className="employee-table">
    <thead>
      <tr>
        <th>Employee</th>
        <th>Department</th>
        <th>Leave Type</th>
        <th>From</th>
        <th>To</th>
        <th>Days</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {filteredLeaveRequests.map((request) => (
        <tr key={request.id}>
          <td>
            <strong>{request.name}</strong>
            <small>{request.employeeId}</small>
          </td>

          <td>{request.department}</td>
          <td>{request.leaveType}</td>
          <td>{request.fromDate}</td>
          <td>{request.toDate}</td>
          <td>{request.days}</td>
          <td>
  <span
    className={`leave-status-badge ${request.status.toLowerCase()}`}
  >
    {request.status}
  </span>
</td>

          <td>

        <button
  className="action-button"
  onClick={() => setViewLeave(request)}
>
  View
</button>

  {request.status === "Pending" ? (
    <>
      <button
        className="leave-approve-btn"
        onClick={() =>
          handleLeaveStatus(request.id, "Approved")
        }
      >
        Approve
      </button>

      <button
        className="leave-reject-btn"
        onClick={() =>
          handleLeaveStatus(request.id, "Rejected")
        }
      >
        Reject
      </button>

      <button
   className="leave-cancel-btn"
  onClick={() => handleCancelLeave(request.id)}
>
  Cancel
</button>

    </>
  ) : (
    "-"
  )}
</td>
        </tr>
      ))}
      {filteredLeaveRequests.length === 0 && (
  <tr>
    <td
      colSpan="8"
      style={{ textAlign: "center", padding: "20px" }}
    >
      No leave requests found
    </td>
  </tr>
)}
    </tbody>
  </table>
</div>

{showLeaveForm && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>New Leave Request</h2>

      <div className="form-group">
  <label>Employee</label>

  <select
    value={newLeave.employeeId}
    onChange={(e) =>
      setNewLeave({
        ...newLeave,
        employeeId: e.target.value,
      })
    }
  >
    <option value="">Select Employee</option>
    {employees.map((employee) => (
  <option
    key={employee.id}
    value={employee.id}
  >
    {employee.name} ({employee.id})
  </option>
))}
  </select>
</div>

<div className="form-group">
  <label>Leave Type</label>

  <select
    value={newLeave.leaveType}
    onChange={(e) =>
      setNewLeave({
        ...newLeave,
        leaveType: e.target.value,
      })
    }
  >
    <option value="">Select Leave Type</option>
    <option value="Annual Leave">Annual Leave</option>
    <option value="Sick Leave">Sick Leave</option>
    <option value="Casual Leave">Casual Leave</option>
  </select>
</div>

<div className="form-group">
  <label>From Date</label>

  <input
    type="date"
    min={todayDate}
    value={newLeave.fromDate}
    onChange={(e) =>
      setNewLeave({
        ...newLeave,
        fromDate: e.target.value,
      })
    }
  />
</div>

<div className="form-group">
  <label>To Date</label>

  <input
    type="date"
    min={newLeave.fromDate || todayDate}
    value={newLeave.toDate}
    onChange={(e) =>
      setNewLeave({
        ...newLeave,
        toDate: e.target.value,
      })
    }
  />
</div>

{newLeave.fromDate && newLeave.toDate && (
  <div className="leave-request-days">
    Requested Days: <strong>{getRequestedDays()} days</strong>
  </div>
)}

{isLeaveLimitExceeded() && (
  <div className="leave-limit-warning">
    Selected leave days exceed the remaining leave balance.
  </div>
)}

{hasLiveOverlap() && (
  <div className="leave-overlap-warning">
    This employee already has a leave request for the selected dates.
  </div>
)}

<div className="form-group">
  <label>Reason</label>

  <textarea
    placeholder="Enter leave reason"
    value={newLeave.reason}
    onChange={(e) =>
      setNewLeave({
        ...newLeave,
        reason: e.target.value,
      })
    }
  />
</div>

{newLeave.employeeId && (
  <div className="leave-balance-box">
    <p
  className={
    newLeave.leaveType === "Annual Leave"
      ? "leave-balance-active"
      : ""
  }
>
  Annual Leave:{" "}
  <strong>
    {getRemainingLeave(newLeave.employeeId, "Annual Leave")} days
  </strong>
</p>


    <p
  className={
    newLeave.leaveType === "Casual Leave"
      ? "leave-balance-active"
      : ""
  }
>
  Casual Leave:{" "}
  <strong>
    {getRemainingLeave(newLeave.employeeId, "Casual Leave")} days
  </strong>
</p>


   <p
  className={
    newLeave.leaveType === "Sick Leave"
      ? "leave-balance-active"
      : ""
  }
>
  Sick Leave:{" "}
  <strong>
    {getRemainingLeave(newLeave.employeeId, "Sick Leave")} days
  </strong>
</p>
  </div>
)}

<div className="leave-modal-action">
<button
  className="leave-submit-btn"
  onClick={handleAddLeaveRequest}
  disabled={
    (
      newLeave.employeeId &&
      newLeave.leaveType &&
      getRemainingLeave(
        newLeave.employeeId,
        newLeave.leaveType
      ) <= 0
    ) ||
    isLeaveLimitExceeded() ||
    hasLiveOverlap()
  }
>
  Submit Leave Request
</button>

      <button
        className="leave-close-btn"
        onClick={() => setShowLeaveForm(false)}
      >
        Close
      </button>
    </div>
  </div>
  </div>
)}

{viewLeave && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Leave Request Details</h2>

      <div className="leave-view-details">
        <p><strong>Employee:</strong> {viewLeave.name}</p>
        <p><strong>Employee ID:</strong> {viewLeave.employeeId}</p>
        <p><strong>Department:</strong> {viewLeave.department}</p>
        <p><strong>Leave Type:</strong> {viewLeave.leaveType}</p>
        <p><strong>From Date:</strong> {viewLeave.fromDate}</p>
        <p><strong>To Date:</strong> {viewLeave.toDate}</p>
        <p><strong>Days:</strong> {viewLeave.days}</p>
        <p><strong>Status:</strong> {viewLeave.status}</p>
        <p>
          <strong>Reason:</strong>{" "}
          {viewLeave.reason || "No reason provided"}
        </p>
      </div>

      <div className="leave-modal-actions">
        <button
          className="leave-close-btn"
          onClick={() => setViewLeave(null)}
        >
          Close
        </button>
      </div>
    </div>

  {replacementModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>AI Shift Replacement</h2>

      <p>
        <strong>Employee:</strong>{" "}
        {replacementModal.leave.name} (
        {replacementModal.leave.employeeId})
      </p>

      <p>
        <strong>Approved Leave:</strong>{" "}
        {replacementModal.leave.fromDate} to{" "}
        {replacementModal.leave.toDate}
      </p>

      <div
        style={{
          marginTop: "20px",
          display: "grid",
          gap: "12px",
        }}
      >
        {replacementModal.recommendations.map(
          (recommendation) => (
            <div
              key={recommendation.scheduleId}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
              }}
            >
              <p>
                <strong>Date:</strong>{" "}
                {recommendation.date}
              </p>

              <p>
                <strong>Shift:</strong>{" "}
                {recommendation.shift}
              </p>

              {recommendation.unavailable ? (
                <>
                  <p>
                    <strong>Status:</strong>{" "}
                    No automatic replacement available
                  </p>

                  <p>
                    {recommendation.message}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>
                      AI Recommended:
                    </strong>{" "}
                    {
                      recommendation.replacementEmployeeName
                    }{" "}
                    (
                    {
                      recommendation.replacementEmployeeId
                    }
                    )
                  </p>

                  <p>
                    {recommendation.reason}
                  </p>

                  <button
                    className="leave-approve-btn"
                    onClick={() =>
                      handleConfirmReplacement(
                        recommendation
                      )
                    }
                  >
                    Confirm Replacement
                  </button>
                </>
              )}
            </div>
          )
        )}
      </div>

      <div className="leave-modal-actions">
        <button
          className="leave-close-btn"
          onClick={() =>
            setReplacementModal(null)
          }
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

  </div>
)}

</div>
                    

    );
}

export default Leave;