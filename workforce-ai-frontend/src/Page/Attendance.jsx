import { useEffect, useState } from "react";

function Attendance() {
  const attendanceSettings =
  JSON.parse(localStorage.getItem("attendanceSettings")) || {};

const shiftStartTime =
  attendanceSettings.shiftStartTime || "06:00";

const lateGracePeriod =
  Number(attendanceSettings.lateGracePeriod || 10);

const standardWorkingHours =
  Number(attendanceSettings.standardWorkingHours || 8);

    const [showCheckInForm, setShowCheckInForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [departmentFilter, setDepartmentFilter] = useState("All Departments");
   const [attendanceRecords, setAttendanceRecords] = useState([]);
const [employees, setEmployees] = useState([]);

useEffect(() => {
  fetch("https://fairwork-hfg5sscn.b4a.run/api/attendance")
    .then((response) => response.json())
    .then((data) => {
      setAttendanceRecords(
        data.map((record) => ({
          ...record,
          overtime: record.overtime || "-",
        }))
      );
    })
    .catch((error) => {
      console.error("Error fetching attendance:", error);
    });
}, []);

useEffect(() => {
  fetch("https://fairwork-hfg5sscn.b4a.run/api/employees")
    .then((response) => response.json())
    .then((data) => {
      setEmployees(data);
    })
    .catch((error) => {
      console.error("Error fetching employees:", error);
    });
}, []);



const today = new Date();

const currentDate = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const todayAttendanceRecords = attendanceRecords.filter(
  (record) => record.date === currentDate
);

const filteredAttendanceRecords = todayAttendanceRecords.filter((record) => {
  const search = searchTerm.toLowerCase().trim();

  const matchesSearch =
    record.name.toLowerCase().includes(search) ||
    record.employeeId?.toLowerCase().includes(search) ||
    record.department.toLowerCase().includes(search);

  const matchesStatus =
    statusFilter === "All Status" ||
    record.status === statusFilter;

  const matchesDepartment =
    departmentFilter === "All Departments" ||
    record.department === departmentFilter;

  return matchesSearch && matchesStatus && matchesDepartment;
});

const allEmployeesCheckedIn =
  employees.length > 0 &&
  employees.every((employee) =>
    attendanceRecords.some(
      (record) =>
        record.employeeId === employee.id &&
        record.date === currentDate &&
        record.checkIn !== "-"
    )
  );

const totalEmployees = employees.length;

const presentCount = todayAttendanceRecords.filter(
  (record) => record.status === "Present"
).length;

const lateCount = todayAttendanceRecords.filter(
  (record) => record.status === "Late"
).length;

const absentCount = Math.max(
  totalEmployees - presentCount - lateCount,
  0
);

const attendedCount = presentCount + lateCount;

const attendanceRate =
  totalEmployees > 0
    ? Math.round((attendedCount / totalEmployees) * 100)
    : 0;

    const absentEmployees = employees.filter(
  (employee) =>
    !todayAttendanceRecords.some(
      (record) => record.employeeId === employee.id
    )
);

const absentEmployeeRecords = absentEmployees.map(
  (employee) => ({
    id: `ABSENT-${employee.id}`,
    employeeId: employee.id,
    name: employee.name,
    department: employee.department,
    checkIn: "-",
    checkOut: "-",
    workingHours: "-",
    overtime: "-",
    status: "Absent",
  })
);

    const attendanceAnomalies = [
  ...todayAttendanceRecords.filter((record) => {
    const isAbsent = record.status === "Absent";
    const isLate = record.status === "Late";

    let isLongHours = false;

    if (record.workingHours !== "-") {
      const hours = parseInt(record.workingHours);
      isLongHours = hours >= 12;
    }

    return isAbsent || isLate || isLongHours;
  }),
  ...absentEmployeeRecords,
];

const anomalyCount = attendanceAnomalies.length;

const totalOvertimeMinutes = todayAttendanceRecords.reduce((total, record) => {
  if (record.overtime === "-") {
    return total;
  }

  const hoursMatch = record.overtime.match(/(\d+)h/);
  const minutesMatch = record.overtime.match(/(\d+)m/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

  return total + hours * 60 + minutes;
}, 0);

const totalOvertimeHours = Math.floor(totalOvertimeMinutes / 60);
const totalOvertimeRemainingMinutes = totalOvertimeMinutes % 60;

const totalOvertime = `${totalOvertimeHours}h ${totalOvertimeRemainingMinutes}m`;

const handleExportReport = () => {
  const headers = [
    "Employee ID",
    "Name",
    "Department",
    "Check In",
    "Check Out",
    "Working Hours",
    "Overtime",
    "Status",
  ];

  const rows = todayAttendanceRecords.map((record) => [
    record.employeeId,
    record.name,
    record.department,
    record.checkIn,
    record.checkOut,
    record.workingHours,
    record.overtime,
    record.status,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  const today = new Date().toISOString().split("T")[0];
  link.download = `attendance-report-${today}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

  return (
    <div className="page-content">

      {/* Page Header */}

      <div className="page-header">

        <div>
          <h1>Attendance</h1>
          <p>Monitor employee attendance and working hours</p>
        </div>

       <button
          className="primary-button"
          disabled={allEmployeesCheckedIn}
          onClick={() => {
            setSelectedEmployee("");
            setShowCheckInForm(true);
          }}
        >
          + Check In
      </button>
      

      </div>


      {/* Attendance Stats */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon">
            👥
          </div>

          <div>
            <p>Total Employees</p>
            <h2>{totalEmployees}</h2>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            🟢
          </div>

          <div>
            <p>Present</p>
            <h2>{presentCount}</h2>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            🔴
          </div>

          <div>
            <p>Absent</p>
            <h2>{absentCount}</h2>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            ⏰
          </div>

          <div>
            <p>Late</p>
            <h2>{lateCount}</h2>
          </div>

        </div>

        <div className="stat-card">

        <div className="stat-icon">
          ⚠️
        </div>

        <div>
          <p>Anomalies</p>
          <h2>{anomalyCount}</h2>
        </div>

      </div>

      </div>

      <div className="attendance-rate-card">

  <div>
    <h3>Attendance Rate</h3>
    <p>Overall attendance for today</p>
  </div>

  <div className="attendance-rate-value">
    {attendanceRate}%
  </div>

</div>

<div className="section-title">
  <h2>⚠️ Attendance Anomalies</h2>
  <p>Employees requiring attendance review</p>
</div>

<div className="employee-table-container">

  <table className="employee-table">

    <thead>
      <tr>
        <th>Employee</th>
        <th>Department</th>
        <th>Status</th>
        <th>Working Hours</th>
      </tr>
    </thead>

    <tbody>

    {attendanceAnomalies.length === 0 && (
      <tr>
        <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
          No attendance anomalies found
        </td>
      </tr>
    )}

      {attendanceAnomalies.map((record) => (

        <tr key={record.id}>

          <td>
            <strong>{record.name}</strong>
            <small>{record.employeeId}</small>
          </td>

          <td>{record.department}</td>

          <td>{record.status}</td>

          <td>{record.workingHours}</td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

<div className="section-title report-summary-header">

  <div>
    <h2>📊 Attendance Report Summary</h2>
    <p>Today’s attendance performance overview</p>
  </div>

  <button
  className="primary-button"
  onClick={handleExportReport}
>
  Export Report
</button>

</div>

<div className="stats-grid">

  <div className="stat-card">
    <div>
      <p>Attendance Rate</p>
      <h2>{attendanceRate}%</h2>
    </div>
  </div>

  <div className="stat-card">
    <div>
      <p>Total Overtime</p>
      <h2>{totalOvertime}</h2>
    </div>
  </div>

  <div className="stat-card">
  <div>
    <p>Present Employees</p>
    <h2>{presentCount}</h2>
  </div>
</div>

<div className="stat-card">
  <div>
    <p>Absent Employees</p>
    <h2>{absentCount}</h2>
  </div>
</div>

  <div className="stat-card">
    <div>
      <p>Late Employees</p>
      <h2>{lateCount}</h2>
    </div>
  </div>

  <div className="stat-card">
    <div>
      <p>Anomalies</p>
      <h2>{anomalyCount}</h2>
    </div>
  </div>

</div>

      {/* Attendance Rate */}

      <div className="section-title">

        <h2>Today's Attendance</h2>

        <p>
          Employee attendance and working status
        </p>

      </div>

      <div className="filter-bar">

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
    <option>All Status</option>
    <option>Present</option>
    <option>Late</option>
    <option>Absent</option>
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

</div>


      {/* Attendance Table */}

      <div className="employee-table-container">

        <table className="employee-table">

          <thead>

            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Working Hours</th>
              <th>Overtime</th>
              <th>Status</th>
              <th>Action</th>
            </tr>

          </thead>


          <tbody>

           {filteredAttendanceRecords.length === 0 && (
          <tr>
            <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
              No attendance records found
            </td>
          </tr>
        )}

            {filteredAttendanceRecords.map((record) => (

  <tr key={record.id}>

    <td>
      <strong>{record.name}</strong>
      <small>{record.employeeId}</small>
    </td>


    <td>
      {record.department}
    </td>

    <td>
      {record.checkIn}
    </td>

    <td>
      {record.checkOut}
    </td>

    <td>
      {record.workingHours}
    </td>

   <td>
    {record.overtime !== "-" ? (
      <span className="status overtime-status">
        {record.overtime}
      </span>
    ) : (
      "-"
    )}
  </td>

    <td>

      <span
       className={
        record.status === "Present"
            ? "status active-status"
            : record.status === "Late"
            ? "status late-status"
            : "status leave-status"
        }
      >
        {record.status}
      </span>

    </td>
    <td>
  <button
    className="action-button"
    disabled={record.checkIn === "-" || record.checkOut !== "-"}
    onClick={() => {
        if (record.checkIn === "-") {
        alert("Employee must check in before checking out.");
        return;
        }
        if (record.checkOut !== "-") {
        alert("Employee has already checked out.");
        return;
        }
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const today = new Date();

const todayDate = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const checkInTime = new Date(`${todayDate} ${record.checkIn}`);
const checkOutTime = new Date();

const differenceInMs = checkOutTime - checkInTime;

const totalMinutes = Math.floor(differenceInMs / (1000 * 60));

const hours = Math.floor(totalMinutes / 60);
const minutes = totalMinutes % 60;

const calculatedWorkingHours = `${hours}h ${minutes}m`;

const standardWorkMinutes = standardWorkingHours * 60;

const overtimeMinutes =
  totalMinutes > standardWorkMinutes
    ? totalMinutes - standardWorkMinutes
    : 0;

const overtimeHours = Math.floor(overtimeMinutes / 60);
const overtimeRemainingMinutes = overtimeMinutes % 60;

const calculatedOvertime =
  overtimeMinutes > 0
    ? `${overtimeHours}h ${overtimeRemainingMinutes}m`
    : "-";

const updatedAttendance = {
  employeeId: record.employeeId,
  date: record.date,
  name: record.name,
  department: record.department,
  checkIn: record.checkIn,
  checkOut: currentTime,
  workingHours: calculatedWorkingHours,
  overtime: calculatedOvertime,
  status: record.status,
};

fetch(`https://fairwork-hfg5sscn.b4a.run/api/attendance/${record.id}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(updatedAttendance),
})
  .then((response) => {
  if (!response.ok) {
    throw new Error("Failed to check out employee");
  }

  return response.json();
})
.then((savedRecord) => {
    setAttendanceRecords((prevRecords) =>
  prevRecords.map((item) =>
    item.id === record.id
      ? {
          ...savedRecord,
          overtime: savedRecord.overtime || calculatedOvertime,
        }
      : item
  )
);
    alert("Employee checked out successfully!");
  })
  .catch((error) => {
  console.error("Error checking out employee:", error);
  alert("Failed to check out employee.");
});
    }}
  >
    Check Out
  </button>
</td>

  </tr>

))}

          </tbody>

        </table>

        {showCheckInForm && (

  <div className="modal-overlay">

    <div className="modal">

      <div className="modal-header">
        <h2>Employee Check In</h2>

        <button
          className="close-button"
          onClick={() => setShowCheckInForm(false)}
        >
          ×
        </button>
      </div>

      <p>Select an employee to record attendance.</p>

      <div className="form-group">

  <label>Employee</label>

  <select
    value={selectedEmployee}
    onChange={(e) => setSelectedEmployee(e.target.value)}
  >
    <option value="">Select Employee</option>

    {employees.map((employee) => {
  const alreadyCheckedIn = todayAttendanceRecords.some(
    (record) => record.employeeId === employee.id
  );

  return (
    <option
      key={employee.id}
      value={employee.id}
      disabled={alreadyCheckedIn}
    >
      {employee.id} - {employee.name}
      {alreadyCheckedIn ? " (Checked In)" : ""}
    </option>
  );
})}

  </select>

</div>

      <div className="modal-actions">

        <button
          className="secondary-button"
          onClick={() => setShowCheckInForm(false)}
        >
          Cancel
        </button>

        <button
  className="primary-button"
  onClick={() => {
    if (!selectedEmployee) {
      alert("Please select an employee.");
      return;
    }

   const employeeRecord = employees.find(
  (employee) => employee.id === selectedEmployee
);

const today = new Date();

const todayDate = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const existingAttendance = attendanceRecords.find(
  (record) =>
    record.employeeId === selectedEmployee &&
    record.date === todayDate
);

if (existingAttendance) {
  alert("Employee has already checked in today.");
  return;
}

  const now = new Date();

const currentTime = now.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
});

const [shiftHour, shiftMinute] = shiftStartTime
  .split(":")
  .map(Number);

const shiftStart = new Date();

shiftStart.setHours(
  shiftHour,
  shiftMinute,
  0,
  0
);

const lateLimit = new Date(
  shiftStart.getTime() + lateGracePeriod * 60000
);

const attendanceStatus =
  now > lateLimit
    ? "Late"
    : "Present";


   const newAttendanceRecord = {
  employeeId: employeeRecord.id,
  date: todayDate,
  name: employeeRecord.name,
  department: employeeRecord.department,
  checkIn: currentTime,
  checkOut: "-",
  workingHours: "-",
  overtime: "-",
  status: attendanceStatus,
};

fetch("https://fairwork-hfg5sscn.b4a.run/api/attendance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(newAttendanceRecord),
})
  .then((response) => {
  if (!response.ok) {
    throw new Error("Failed to check in employee");
  }

  return response.json();
})
  .then((savedRecord) => {
  setAttendanceRecords((prevRecords) => [
    ...prevRecords,
    {
      ...savedRecord,
      overtime: savedRecord.overtime || "-",
    },
  ]);

  setSelectedEmployee("");
  setShowCheckInForm(false);

  alert("Employee checked in successfully!");
})
.catch((error) => {
  console.error("Error checking in employee:", error);
  alert("Failed to check in employee.");
});
  }}
>
  Confirm Check In
</button>

      </div>

    </div>

  </div>

)}

      </div>

    </div>
  );
}

export default Attendance;