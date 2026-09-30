import { useEffect, useState } from "react";

function Shifts() {

  const departments = [
  "Dry",
  "Meat",
  "Bakery",
  "Production Bakery",
  "Liquor",
  "Admin",
  "Cashier",
  "Vegetable",
  "Pharmacy",
  "Food",
];

const shiftTypes = {
  "Full Day": {
    startTime: "06:00",
    endTime: "23:00",
  },
  "Half Day": {
    startTime: "",
    endTime: "",
  },
  "Morning": {
    startTime: "06:00",
    endTime: "15:00",
  },
  "Evening": {
    startTime: "14:00",
    endTime: "23:00",
  },
};

const getShiftTimeDisplay = (shift) => {
  if (!shift) {
    return "";
  }

  if (
    shift.startTime === "06:00" &&
    shift.endTime === "23:00"
  ) {
    return "06:00 AM - 11:00 PM";
  }

  if (
    shift.startTime === "06:00" &&
    shift.endTime === "11:00"
  ) {
    return "06:00 AM - 11:00 AM";
  }

  if (
    shift.startTime === "16:00" &&
    shift.endTime === "23:00"
  ) {
    return "04:00 PM - 11:00 PM";
  }

  return `${shift.startTime} - ${shift.endTime}`;
};

  const [showForm, setShowForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showAIRecommendation, setShowAIRecommendation] = useState(false);
  const [aiShift, setAiShift] = useState(null);
  const [recommendedEmployees, setRecommendedEmployees] = useState([]);
  const [viewShift, setViewShift] = useState(null);

  const [employees, setEmployees] = useState([]);

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

const [selectedEmployees, setSelectedEmployees] = useState([]);
const [assignedEmployees, setAssignedEmployees] = useState({});

  const [shifts, setShifts] = useState([]);

  useEffect(() => {
  fetch("https://fairwork-hfg5sscn.b4a.run/api/shifts")
    .then((response) => response.json())
    .then((data) => {
      setShifts(data);
    })
    .catch((error) => {
      console.error("Error fetching shifts:", error);
    });
}, []);

useEffect(() => {
  fetch("https://fairwork-hfg5sscn.b4a.run/api/shift-assignments")
    .then((response) => response.json())
    .then((data) => {
      const groupedAssignments = {};

      data.forEach((assignment) => {
        if (!groupedAssignments[assignment.shiftId]) {
          groupedAssignments[assignment.shiftId] = [];
        }

        groupedAssignments[assignment.shiftId].push(
          assignment.employeeId
        );
      });

      setAssignedEmployees(groupedAssignments);
    })
    .catch((error) => {
      console.error(
        "Error fetching shift assignments:",
        error
      );
    });
}, []);

  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    department: "",
    requiredEmployees: "",
  });

  const handleEmployeeSelect = (employeeId) => {

  if (selectedEmployees.includes(employeeId)) {

    setSelectedEmployees(
      selectedEmployees.filter((id) => id !== employeeId)
    );

  } else {

    setSelectedEmployees([
      ...selectedEmployees,
      employeeId,
    ]);

  }

};

const handleRemoveEmployee = (employeeId) => {
  if (!viewShift) {
    return;
  }

  fetch(
    `https://fairwork-hfg5sscn.b4a.run/api/shift-assignments/shift/${viewShift.id}/employee/${employeeId}`,
    {
      method: "DELETE",
    }
  )
    .then((response) => {
      if (response.ok) {
        const currentEmployees =
          assignedEmployees[viewShift.id] || [];

        const updatedEmployees = currentEmployees.filter(
          (id) => id !== employeeId
        );

        setAssignedEmployees({
          ...assignedEmployees,
          [viewShift.id]: updatedEmployees,
        });
      }
    })
    .catch((error) => {
      console.error("Error removing employee:", error);
    });
};

  const handleChange = (e) => {
  const { name, value } = e.target;

  // Shift type selected
  if (name === "name") {

    // Full Day → time automatically set
    if (value === "Full Day") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        startTime: "06:00",
        endTime: "23:00",
      }));
      return;
    }

    // Half Day → user must select Morning / Evening
    if (value === "Half Day") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        startTime: "",
        endTime: "",
      }));
      return;
    }

    if (value === "Morning") {
  setFormData((prev) => ({
    ...prev,
    name: value,
    startTime: "06:00",
    endTime: "15:00",
  }));
  return;
}

if (value === "Evening") {
  setFormData((prev) => ({
    ...prev,
    name: value,
    startTime: "14:00",
    endTime: "23:00",
  }));
  return;
}

    setFormData((prev) => ({
      ...prev,
      name: value,
      startTime: "",
      endTime: "",
    }));

    return;
  }

  // Half Day time slot selected
  if (name === "halfDaySlot") {

    if (value === "morning") {
      setFormData((prev) => ({
        ...prev,
        startTime: "06:00",
        endTime: "11:00",
      }));
    }

    if (value === "evening") {
      setFormData((prev) => ({
        ...prev,
        startTime: "16:00",
        endTime: "23:00",
      }));
    }

    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleSubmit = (e) => {
  e.preventDefault();

  const maxShiftNumber = shifts.reduce((max, shift) => {
    const number = Number(
      String(shift.id || "").replace("SH", "")
    );

    return Number.isNaN(number)
      ? max
      : Math.max(max, number);
  }, 0);

  const newShiftId = `SH${String(
    maxShiftNumber + 1
  ).padStart(3, "0")}`;

  const newShift = {
    id: newShiftId,
    name: formData.name,
    startTime: formData.startTime,
    endTime: formData.endTime,
    department: formData.department,
    requiredEmployees: Number(formData.requiredEmployees),
    status: "Active",
  };

  fetch("https://fairwork-hfg5sscn.b4a.run/api/shifts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newShift),
  })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to create shift");
      }

      return response.json();
    })
    .then((savedShift) => {
      setShifts((prev) => [...prev, savedShift]);

      setFormData({
        name: "",
        startTime: "",
        endTime: "",
        department: "",
        requiredEmployees: "",
      });

      setShowForm(false);
    })
    .catch((error) => {
      console.error("Error creating shift:", error);
      alert(error.message || "Failed to create shift");
    });
};

  return (
    <div className="page-content">

      {/* Page Header */}

      <div className="page-header">

        <div>
          <h1>Shift Management</h1>
          <p>Manage and monitor employee shifts</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Create Shift
        </button>

      </div>

{/* Statistics */}

<div className="stats-grid">

  <div className="stat-card">
    <div className="stat-icon">☀️</div>
    <div>
      <p>Full Day Shifts</p>
      <h2>
        {
          shifts.filter(
            (shift) => shift.name === "Full Day"
          ).length
        }
      </h2>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon">🕐</div>
    <div>
      <p>Half Day Shifts</p>
      <h2>
        {
          shifts.filter(
            (shift) => shift.name === "Half Day"
          ).length
        }
      </h2>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon">👥</div>
    <div>
      <p>Total Shifts</p>
      <h2>{shifts.length}</h2>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon">⚠️</div>
    <div>
      <p>Staff Shortages</p>
      <h2>
        {
          shifts.filter(
            (shift) =>
              (assignedEmployees[shift.id]?.length || 0) <
              shift.requiredEmployees
          ).length
        }
      </h2>
    </div>
  </div>

</div>

      {/* Current Shifts */}

      <div className="section-title">

  <div>
    <h2>Current Shifts</h2>

    <p>
      Manage your organization's scheduled shifts
    </p>
  </div>

  <button
    className="ai-button"
   onClick={() => {

  const recommendedShift = shifts.find(
    (shift) =>
      (assignedEmployees[shift.id]?.length || 0)
      < shift.requiredEmployees
  );

  const selectedShiftForAI =
    recommendedShift || shifts[0];

  setAiShift(selectedShiftForAI);

  const assigned =
    assignedEmployees[selectedShiftForAI.id] || [];

  const shortage =
    selectedShiftForAI.requiredEmployees - assigned.length;

  const availableEmployees = employees
    .filter(
      (employee) =>
        employee.department === selectedShiftForAI.department &&
        !assigned.includes(employee.id)
    )
    .slice(0, Math.max(shortage, 0));

  setRecommendedEmployees(availableEmployees);

  setShowAIRecommendation(true);
}}
  >
    🤖 AI Recommend Shifts
  </button>

</div>


      {/* Shift Table */}

      <div className="employee-table-container">

        <table className="employee-table">

          <thead>

            <tr>
              <th>Shift</th>
              <th>Time</th>
              <th>Department</th>
              <th>Required Employees</th>
              <th>Assigned</th>
              <th>Status</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {shifts.map((shift) => (

              <tr key={shift.id}>

                <td>
                  <strong>{shift.name}</strong>
                  <small>{shift.id}</small>
                </td>

                <td>
                  {getShiftTimeDisplay(shift)}
                </td>

                <td>
                  {shift.department}
                </td>

                <td>
                  {shift.requiredEmployees}
                </td>

                <td>
                {assignedEmployees[shift.id]?.length || 0}
                {" / "}
                {shift.requiredEmployees}
                </td>

                <td>
                  <span className="status active-status">
                    {shift.status}
                  </span>
                </td>

               <td>

            <button
                className="action-button"
                onClick={() => setSelectedShift(shift)}
            >
                Assign
            </button>

            <button
                className="action-button"
                 onClick={() => setViewShift(shift)}
            >
                View
            </button>

            </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


    {/* Create Shift Modal */}

{showForm && (
  <div className="modal-overlay">

    <div className="employee-modal">

      <div className="modal-header">
        <div>
          <h2>Create New Shift</h2>
          <p>Enter shift information below</p>
        </div>

        <button
          type="button"
          className="close-button"
          onClick={() => setShowForm(false)}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>

        <div className="form-grid">

          {/* Shift Type */}
          <div className="form-group">
            <label>Shift Type</label>

            <select
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Shift
              </option>

              <option value="Full Day">
                Full Day
              </option>

              <option value="Half Day">
                Half Day
              </option>

              <option value="Morning">
  Morning
</option>

<option value="Evening">
  Evening
</option>

            </select>
          </div>

          {/* Working Time */}
          {/* Working Time */}
<div className="form-group">
  <label>Working Time</label>

  {formData.name === "Full Day" && (
    <input
      type="text"
      value="06:00 AM - 11:00 PM"
      readOnly
    />
  )}

  {formData.name === "Half Day" && (
    <select
      name="halfDaySlot"
      onChange={handleChange}
      required
      defaultValue=""
    >
      <option value="">Select Half Day Time</option>
      <option value="morning">
        06:00 AM - 11:00 AM
      </option>
      <option value="evening">
        04:00 PM - 11:00 PM
      </option>
    </select>
  )}

  {formData.name === "Morning" && (
    <input
      type="text"
      value="06:00 AM - 03:00 PM"
      readOnly
    />
  )}

  {formData.name === "Evening" && (
    <input
      type="text"
      value="02:00 PM - 11:00 PM"
      readOnly
    />
  )}

  {!formData.name && (
    <input
      type="text"
      value=""
      placeholder="Select shift type first"
      readOnly
    />
  )}
</div>

          {/* Department */}
          <div className="form-group">
            <label>Department</label>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Department
              </option>

              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              ))}
            </select>
          </div>

          {/* Required Employees */}
          <div className="form-group">
            <label>Required Employees</label>

            <input
              type="number"
              name="requiredEmployees"
              placeholder="Enter number of employees"
              min="1"
              value={formData.requiredEmployees}
              onChange={handleChange}
              required
            />
          </div>

        </div>

        <div className="form-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            Create Shift
          </button>

        </div>

      </form>

    </div>

  </div>
)}

      {/* Assign Employees Modal */}

      {selectedShift && (

        <div className="modal-overlay">

          <div className="employee-modal">

            <div className="modal-header">

              <div>
                <h2>Assign Employees</h2>

                <p>
                  Assign employees to {selectedShift.name}
                </p>
              </div>

              <button
                className="close-button"
                onClick={() => setSelectedShift(null)}
              >
                ✕
              </button>

            </div>


            <div className="details-grid">

              <div className="detail-item">

                <span>Shift</span>

                <strong>
                  {selectedShift.name}
                </strong>

              </div>

              <div className="employee-selection">

  <h3>Select Employees</h3>

  <p>
    Select employees for this shift
  </p>

  <div className="employee-list">

    {employees
      .filter(
        (employee) =>
          employee.department === selectedShift.department
      )
      .map((employee) => (

        <label
          key={employee.id}
          className="employee-option"
        >

          <input
            type="checkbox"
            checked={selectedEmployees.includes(employee.id)}
            onChange={() =>
              handleEmployeeSelect(employee.id)
            }
          />

          <div>

            <strong>
              {employee.name}
            </strong>

            <small>
              {employee.id} • {employee.role}
            </small>

          </div>

        </label>

      ))}

  </div>

</div>


              <div className="detail-item">

                <span>Department</span>

                <strong>
                  {selectedShift.department}
                </strong>

              </div>


              <div className="detail-item">

                <span>Time</span>

                <strong>
                  {getShiftTimeDisplay(selectedShift)}
                </strong>

              </div>


              <div className="detail-item">

                <span>Required Employees</span>

                <strong>
                  {selectedShift.requiredEmployees}
                </strong>

              </div>

            </div>

          
            <div className="form-actions">

  <button
    className="cancel-button"
    onClick={() => {
      setSelectedEmployees([]);
      setSelectedShift(null);
    }}
  >
    Cancel
  </button>

  <button
  className="primary-button"
  onClick={() => {

    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    if (
      selectedEmployees.length >
      selectedShift.requiredEmployees
    ) {
      alert(
        `You can assign maximum ${selectedShift.requiredEmployees} employees to this shift.`
      );
      return;
    }

    const employeesToAssign = employees.filter((employee) =>
  selectedEmployees.includes(employee.id)
);

Promise.all(
  employeesToAssign.map((employee) =>
    fetch("https://fairwork-hfg5sscn.b4a.run/api/shift-assignments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shiftId: selectedShift.id,
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
      }),
    }).then((response) => response.json())
  )
)
  .then(() => {
    setAssignedEmployees({
      ...assignedEmployees,
      [selectedShift.id]: selectedEmployees,
    });

    alert(
      `${selectedEmployees.length} employee(s) assigned successfully!`
    );

    setSelectedEmployees([]);
    setSelectedShift(null);
  })
  .catch((error) => {
    console.error("Error assigning employees:", error);
    alert("Failed to assign employees.");
  });

  }}
>
  Assign Employees
</button>

  <div className="selected-count">

  Selected: {selectedEmployees.length} /{" "}
  {selectedShift.requiredEmployees}

</div>

</div>

          </div>

        </div>

      )}

      {/* View Assigned Employees Modal */}

{viewShift && (

  <div className="modal-overlay">

    <div className="employee-modal">

      <div className="modal-header">

        <div>
          <h2>Assigned Employees</h2>

          <p>
            Employees assigned to {viewShift.name}
          </p>
        </div>

        <button
          className="close-button"
          onClick={() => setViewShift(null)}
        >
          ✕
        </button>

      </div>


      <div className="details-grid">

        <div className="detail-item">

          <span>Shift</span>

          <strong>
            {viewShift.name}
          </strong>

        </div>


        <div className="detail-item">

          <span>Department</span>

          <strong>
            {viewShift.department}
          </strong>

        </div>


        <div className="detail-item">

          <span>Time</span>

          <strong>
            {getShiftTimeDisplay(viewShift)}
          </strong>

        </div>


        <div className="detail-item">

          <span>Assigned</span>

          <strong>
            {assignedEmployees[viewShift.id]?.length || 0}
            {" / "}
            {viewShift.requiredEmployees}
          </strong>

        </div>

      </div>


      <div className="employee-selection">

        <h3>Employees</h3>

        <div className="employee-list">

          {assignedEmployees[viewShift.id]?.length > 0 ? (

            employees
              .filter((employee) =>
                assignedEmployees[viewShift.id].includes(employee.id)
              )
              .map((employee) => (

                <div
                  key={employee.id}
                  className="employee-option"
                >

                  <div>

                    <strong>
                      {employee.name}
                    </strong>

                    <small>
                      {employee.id} • {employee.role}
                    </small>

                  </div>

                   <button
                    className="action-button"
                    onClick={() => handleRemoveEmployee(employee.id)}
                    >
                    Remove
                    </button>

                </div>

              ))

          ) : (

            <p>
              No employees assigned to this shift yet.
            </p>

          )}

        </div>

      </div>


      <div className="form-actions">

        <button
          className="cancel-button"
          onClick={() => setViewShift(null)}
        >
          Close
        </button>

      </div>

    </div>

  </div>

)}

{/* AI Recommendation Modal */}

{showAIRecommendation && (

  <div className="modal-overlay">

    <div className="employee-modal">

      <div className="modal-header">

        <div>
          <h2>🤖 AI Shift Recommendations</h2>

          <p>
            Intelligent workforce recommendations
          </p>
        </div>

        <button
          className="close-button"
          onClick={() => setShowAIRecommendation(false)}
        >
          ✕
        </button>

      </div>


      <div className="insight-card">

        <div className="insight-header">

          <span>⚠️</span>

          <h3>Staff Shortage Detected</h3>

        </div>

        <p>
          AI detected insufficient staff for the
            {aiShift?.name} in the {aiShift?.department} Department.
        </p>

      </div>


      <div className="details-grid">

        <div className="detail-item">
          <span>Department</span>
          <strong>{aiShift?.department}</strong>
        </div>

        <div className="detail-item">
          <span>Shift</span>
         <strong>{aiShift?.name}</strong>
        </div>

        <div className="detail-item">
          <span>Required Employees</span>
          <strong>{aiShift?.requiredEmployees}</strong>
        </div>

        <div className="detail-item">
          <span>Current Assigned</span>
         <strong>
            {aiShift
                ? assignedEmployees[aiShift.id]?.length || 0
                : 0}
            </strong>
        </div>

      </div>

               <div className="employee-selection">

  <h3>🤖 Recommended Employees</h3>

  <p>
    Based on department and current shift availability
  </p>

  <div className="employee-list">

    {recommendedEmployees.length > 0 ? (

      recommendedEmployees.map((employee) => (

        <div
          key={employee.id}
          className="employee-option"
        >

          <div>

            <strong>
              {employee.name}
            </strong>

            <small>
              {employee.id} • {employee.role}
            </small>

          </div>

          <span className="status active-status">
            Available
          </span>

        </div>

      ))

    ) : (

      <p>
        No additional employees available for this shift.
      </p>

    )}

  </div>

</div>

{recommendedEmployees.length > 0 && (
  <button
    className="primary-button"
    onClick={() => {

  if (!aiShift || recommendedEmployees.length === 0) {
    return;
  }

  const currentAssigned =
    assignedEmployees[aiShift.id] || [];

  const newEmployeeIds = recommendedEmployees.map(
    (employee) => employee.id
  );

  setAssignedEmployees({
    ...assignedEmployees,
    [aiShift.id]: [
      ...currentAssigned,
      ...newEmployeeIds,
    ],
  });

  setAiShift({
    ...aiShift,
    requiredEmployees: aiShift.requiredEmployees,
  });

  setRecommendedEmployees([]);

  setShowAIRecommendation(false);
}}
  >
    + Assign Recommended Employees
  </button>
)}

      <div className="form-actions">

        <button
          className="cancel-button"
          onClick={() => setShowAIRecommendation(false)}
        >
          Close
        </button>

      </div>

    </div>

  </div>

)}

    </div>
  );
}

export default Shifts;