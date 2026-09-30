import { useEffect, useState } from "react";

function Employees() {

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

const roles = [
  "Manager",
  "Executive",
  "SSA",
  "Supervisor",
  "CSA",
  "Employee",
];

const getSalaryByRole = (role) => {
  switch (role) {
    case "Manager":
      return 60000;

    case "Executive":
      return 80000;

    case "Supervisor":
      return 40000;

    case "SSA":
    case "CSA":
    case "Employee":
      return 32000;

    default:
      return "";
  }
};

  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
const [departmentFilter, setDepartmentFilter] = useState("All Departments");
const [statusFilter, setStatusFilter] = useState("All Status");

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
  fetch("https://fairwork-2h17s2be.b4a.run/api/employees")
    .then((response) => response.json())
    .then((data) => {
  setEmployees(data);
})
    .catch((error) => {
      console.error("Error fetching employees:", error);
    });
}, []);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    role: "",
    salary: "",
    status: "Active",
  });

  const handleChange = (e) => {
  const { name, value } = e.target;

 if (name === "role") {
  const noDepartment =
    value === "Manager" || value === "Executive";

  setFormData((prev) => ({
    ...prev,
    role: value,
    salary: getSalaryByRole(value),
    department: noDepartment ? "" : prev.department,
  }));

  return;
}

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const filteredEmployees = employees.filter((employee) => {

  const search = searchTerm.toLowerCase().trim();

  const matchesSearch =
    employee.name.toLowerCase().includes(search) ||
    employee.id.toLowerCase().includes(search) ||
    employee.department.toLowerCase().includes(search) ||
    employee.role.toLowerCase().includes(search);

  const matchesDepartment =
    departmentFilter === "All Departments" ||
    employee.department === departmentFilter;

  const matchesStatus =
    statusFilter === "All Status" ||
    employee.status === statusFilter;

  return matchesSearch && matchesDepartment && matchesStatus;
});
  const handleSubmit = (e) => {

  e.preventDefault();

  if (editingEmployee) {

  const updatedEmployee = {
    name: formData.name,
    department: formData.department,
    role: formData.role,
    salary: Number(formData.salary),
    status: formData.status,
  };

  fetch(
    `https://fairwork-2h17s2be.b4a.run/api/employees/${editingEmployee.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedEmployee),
    }
  )
    .then((response) => response.json())
    .then((savedEmployee) => {
      setEmployees(
        employees.map((employee) =>
          employee.id === savedEmployee.id
            ? savedEmployee
            : employee
        )
      );

      setEditingEmployee(null);
    })
    .catch((error) => {
      console.error("Error updating employee:", error);
    });

  } else {

    const maxEmployeeNumber = employees.reduce((max, employee) => {
  const number = Number(employee.id.replace("EMP", ""));
  return number > max ? number : max;
}, 0);

const newEmployeeId = `EMP${String(
  maxEmployeeNumber + 1
).padStart(3, "0")}`;

  const newEmployee = {
    id: newEmployeeId,
    name: formData.name,
    department: formData.department,
    role: formData.role,
    salary: Number(formData.salary),
    status: formData.status,
  };

  fetch("https://fairwork-2h17s2be.b4a.run/api/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newEmployee),
  })
    .then((response) => response.json())
    .then((savedEmployee) => {
      setEmployees([...employees, savedEmployee]);
    })
    .catch((error) => {
      console.error("Error adding employee:", error);
    });
}

  setFormData({
    name: "",
    department: "",
    role: "",
    salary: "",
    status: "Active",
  });

  setShowForm(false);
  };

  const handleDelete = (employeeId) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this employee?"
  );

  if (confirmDelete) {

    fetch(`https://fairwork-2h17s2be.b4a.run/api/employees/${employeeId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          setEmployees(
            employees.filter(
              (employee) => employee.id !== employeeId
            )
          );
        }
      })
      .catch((error) => {
        console.error("Error deleting employee:", error);
      });
  }
};

  return (

    <div className="page-content">

      {/* Page Header */}

      <div className="page-header">

        <div>
          <h1>Employees</h1>
          <p>Manage and monitor your workforce</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Add Employee
        </button>

      </div>


      {/* Add Employee Form */}

      {showForm && (

        <div className="form-container">

          <div className="form-header">

            <div>
              <h2>
                 {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </h2>
              <p>Enter employee information below</p>
            </div>

            <button
              className="close-button"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              {/* Name */}

              <div className="form-group">

                <label>Employee Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter employee name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* Department */}

              <div className="form-group">

                <label>Department</label>

                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={
    formData.role === "Manager" ||
    formData.role === "Executive"
  }
  required={
    formData.role !== "Manager" &&
    formData.role !== "Executive"
  }
>
  <option value="">
    {formData.role === "Manager" ||
    formData.role === "Executive"
      ? "No Department"
      : "Select Department"}
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

              {/* Role */}

              <div className="form-group">
  <label>Job Role</label>

  <select
    name="role"
    value={formData.role}
    onChange={handleChange}
    required
  >
    <option value="">Select Job Role</option>

    {roles.map((role) => (
      <option key={role} value={role}>
        {role}
      </option>
    ))}
  </select>
</div>


              {/* Salary */}

              <div className="form-group">
  <label>Basic Salary</label>

  <input
    type="number"
    name="salary"
    value={formData.salary}
    readOnly
    placeholder="Select a job role"
  />
</div>


              {/* Status */}

              <div className="form-group">

                <label>Employment Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="On Leave">
                    On Leave
                  </option>

                </select>

              </div>

            </div>


            {/* Buttons */}

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
                {editingEmployee ? "Save Changes" : "Add Employee"}

              </button>

            </div>

          </form>

        </div>

      )}


     {/* Search and Filters */}
<div className="employee-tools">

  <input
    type="text"
    placeholder="🔍 Search employees..."
    className="search-input"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  {/* Department Filter */}
  <select
    className="filter-select"
    value={departmentFilter}
    onChange={(e) => setDepartmentFilter(e.target.value)}
  >
    <option value="All Departments">All Departments</option>

    {departments.map((department) => (
      <option key={department} value={department}>
        {department}
      </option>
    ))}
  </select>

  {/* Status Filter */}
  <select
    className="filter-select"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="All Status">All Status</option>
    <option value="Active">Active</option>
    <option value="On Leave">On Leave</option>
  </select>

</div>

     {/* Employee Details Modal */}

{selectedEmployee && (
  <div className="modal-overlay">

    <div className="employee-modal">

      <div className="modal-header">

        <div>
          <h2>Employee Details</h2>
          <p>Complete employee information</p>
        </div>

        <button
          className="close-button"
          onClick={() => setSelectedEmployee(null)}
        >
          ✕
        </button>

      </div>


      <div className="employee-profile">

        <div className="large-avatar">
          {selectedEmployee.name.charAt(0)}
        </div>

        <div>
          <h2>{selectedEmployee.name}</h2>
          <p>{selectedEmployee.id}</p>
        </div>

      </div>


      <div className="details-grid">

        <div className="detail-item">
          <span>Department</span>
          <strong>{selectedEmployee.department}</strong>
        </div>

        <div className="detail-item">
          <span>Job Role</span>
          <strong>{selectedEmployee.role}</strong>
        </div>

        <div className="detail-item">
          <span>Basic Salary</span>
          <strong>{selectedEmployee.salary}</strong>
        </div>

        <div className="detail-item">
          <span>Status</span>

          <strong>
            <span
              className={
                selectedEmployee.status === "Active"
                  ? "status active-status"
                  : "status leave-status"
              }
            >
              {selectedEmployee.status}
            </span>
          </strong>

        </div>

      </div>


      <div className="modal-footer">

        <button
          className="cancel-button"
          onClick={() => setSelectedEmployee(null)}
        >
          Close
        </button>

      </div>

    </div>

  </div>
)}


      {/* Employee Table */}

      <div className="employee-table-container">

        <table className="employee-table">

          <thead>

            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {filteredEmployees.map((employee) => (

              <tr key={employee.id}>

                <td>

                  <div className="employee-info">

                    <div className="employee-avatar">
                      {employee.name.charAt(0)}
                    </div>

                    <div>
                      <strong>{employee.name}</strong>
                      <small>{employee.id}</small>
                    </div>

                  </div>

                </td>

                <td>{employee.department}</td>

                <td>{employee.role}</td>

                <td>{employee.salary}</td>

                <td>

                  <span
                    className={
                      employee.status === "Active"
                        ? "status active-status"
                        : "status leave-status"
                    }
                  >
                    {employee.status}
                  </span>

                </td>

                <td>

                  <button 
                  className="action-button"
                   onClick={() => setSelectedEmployee(employee)}
                  >
                    View
                  </button>

                  <button 
                  className="action-button"
                   onClick={() => {
                    setEditingEmployee(employee);
                    setFormData({
                      name: employee.name,
                      department: employee.department,
                      role: employee.role,
                      salary: employee.salary,
                      status: employee.status,
                    });
                    setShowForm(true);
                  }}
                  >
                    Edit
                  </button>

                   <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(employee.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Employees;