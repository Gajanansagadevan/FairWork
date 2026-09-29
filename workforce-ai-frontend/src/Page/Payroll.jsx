import { useEffect, useState } from "react";

function Payroll() {

  const getBasicSalary = (employee) => {
  switch (employee.role) {
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
      return Number(employee.salary) || 32000;
  }
};

const getOvertimeRate = (employee) => {
  switch (employee.role) {
    case "Manager":
    case "Executive":
    case "Supervisor":
      return 180;

    case "SSA":
    case "CSA":
    case "Employee":
    default:
      return 160;
  }
};

    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [cycleStartDate, setCycleStartDate] = useState(() => {
  return (
    localStorage.getItem("payrollCycleStartDate") ||
    "2026-09-28"
  );
});

useEffect(() => {
  localStorage.setItem(
    "payrollCycleStartDate",
    cycleStartDate
  );
}, [cycleStartDate]);

const getCycleLabel = () => {
  if (!cycleStartDate) return "";

  const start = new Date(cycleStartDate + "T00:00:00");
  const end = new Date(start);

  end.setDate(end.getDate() + 27);

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  return `${formatDate(start)}_to_${formatDate(end)}`;
};

const selectedCycle = getCycleLabel();

    const [payrollRecords, setPayrollRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    

    useEffect(() => {
  fetch("http://localhost:8080/api/employees")
    .then((response) => response.json())
    .then((data) => {
      setEmployees(data);
    })
    .catch((error) => {
      console.error("Error fetching employees for payroll:", error);
    });
}, []);

    useEffect(() => {
  fetch("http://localhost:8080/api/payroll")
    .then((response) => response.json())
    .then((data) => {
      setPayrollRecords(data);
    })
    .catch((error) => {
      console.error("Error fetching payroll:", error);
    });
}, []);

useEffect(() => {
  localStorage.setItem(
    "payrollRecords",
    JSON.stringify(payrollRecords)
  );
}, [payrollRecords]);

const [attendanceRecords, setAttendanceRecords] = useState([]);

useEffect(() => {
  fetch("http://localhost:8080/api/attendance")
    .then((response) => response.json())
    .then((data) => {
      setAttendanceRecords(data);
    })
    .catch((error) => {
      console.error(
        "Error fetching attendance for payroll:",
        error
      );
    });
}, []);

const payrollWithNetSalary = payrollRecords.map((record) => {
  const employee = employees.find(
    (item) => item.id === record.employeeId
  );

  const overtimeRate = employee
    ? getOvertimeRate(employee)
    : 160;

  const overtimeHours =
    Number(record.overtimeHours || 0);

  return {
    ...record,
    overtimeHours,
    overtimePay: overtimeHours * overtimeRate,
    netSalary: Number(record.netSalary || 0),
  };
});

const filteredPayrollRecords = payrollWithNetSalary.filter((record) => {
 const matchesSearch =
  (record.name || "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase()) ||
  (record.employeeId || "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesDepartment =
    departmentFilter === "All" ||
    record.department === departmentFilter;

  const matchesStatus =
    statusFilter === "All" ||
    record.status === statusFilter;

    const matchesMonth =
  record.month === selectedCycle;

  return (
  matchesSearch &&
  matchesDepartment &&
  matchesStatus &&
  matchesMonth
);

});



const selectedMonthRecords = payrollWithNetSalary.filter(
  (record) => record.month === selectedCycle
);

const totalEmployees = selectedMonthRecords.length;

const totalPayroll = selectedMonthRecords.reduce(
  (total, record) => total + record.netSalary,
  0
);

const totalOvertimePay = selectedMonthRecords.reduce(
  (total, record) => total + record.overtimePay,
  0
);

const pendingPayments = selectedMonthRecords.filter(
  (record) => record.status === "Pending"
).length;

const handleMarkAsPaid = (id, month) => {
  const record = payrollRecords.find(
    (item) => item.id === id && item.month === month
  );

  if (!record) {
    return;
  }

  const updatedPayroll = {
    ...record,
    status: "Paid",
  };

  fetch(`http://localhost:8080/api/payroll/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedPayroll),
  })
    .then((response) => {
     if (!response.ok) {
  return response.text().then((message) => {
    throw new Error(
      message || "Failed to generate payroll"
    );
  });
}

return response.json();
    })
    .then((savedRecord) => {
      setPayrollRecords((prevRecords) =>
        prevRecords.map((item) =>
          item.id === id && item.month === month
            ? savedRecord
            : item
        )
      );
    })
    .catch((error) => {
      console.error("Error marking payroll as paid:", error);
      alert("Failed to mark payroll as paid.");
    });
};

const handleExportPayroll = () => {
  const headers = [
    "Employee ID",
    "Name",
    "Department",
    "Basic Salary",
    "OT Hours",
    "OT Pay",
    "Deductions",
    "Net Salary",
    "Status",
  ];

  const rows = filteredPayrollRecords.map((record) => [
    record.id,
    record.name,
    record.department,
    record.basicSalary,
    record.overtimeHours,
    record.overtimePay,
    record.deductions,
    record.netSalary,
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
  link.download = "payroll-report.csv";
  link.click();

  URL.revokeObjectURL(url);
};


const handleGeneratePayroll = async () => {
  if (!cycleStartDate) {
    alert("Please select the 4-week cycle start date.");
    return;
  }

  const start = new Date(cycleStartDate + "T00:00:00");

  if (start.getDay() !== 1) {
    alert("Payroll cycle must start on a Monday.");
    return;
  }

  const employeesWithoutPayroll = employees.filter(
    (employee) =>
      !payrollRecords.some(
        (record) =>
          record.employeeId === employee.id &&
          record.month === selectedCycle
      )
  );

  if (employeesWithoutPayroll.length === 0) {
    alert(
      "Payroll already generated for all employees for this 4-week cycle."
    );
    return;
  }

  try {
    const savedRecords = [];

    // Sequential generation avoids partial concurrent requests
    // being harder to diagnose.
    for (const employee of employeesWithoutPayroll) {
      const response = await fetch(
        "http://localhost:8080/api/payroll/generate-four-week",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: employee.id,
            cycleStartDate: cycleStartDate,
            allowances: 0,
            deductions: 0,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            `Failed to generate payroll for ${employee.name}`
        );
      }

      const savedRecord = await response.json();

      savedRecords.push(savedRecord);
    }

    setPayrollRecords((prevRecords) => [
      ...prevRecords,
      ...savedRecords,
    ]);

    alert(
      `4-week payroll generated successfully!\nCycle: ${selectedCycle}`
    );
  } catch (error) {
    console.error(
      "Error generating 4-week payroll:",
      error
    );

    alert(error.message);
  }
};

  return (
    <div className="page-content">
      <div className="page-header">
  <div>
    <h1>Payroll</h1>
    <p>Manage employee salary, overtime and deductions</p>

    <button onClick={handleExportPayroll}>
      Export Payroll
    </button>
  </div>

  <div className="payroll-header-actions">
    <div>
  <label
    style={{
      display: "block",
      fontSize: "12px",
      marginBottom: "4px",
    }}
  >
    4-Week Cycle Start
  </label>

  <input
    type="date"
    value={cycleStartDate}
    onChange={(e) =>
      setCycleStartDate(e.target.value)
    }
  />

  <small
    style={{
      display: "block",
      marginTop: "4px",
    }}
  >
    {selectedCycle.replace("_to_", " → ")}
  </small>
</div>

    <button onClick={handleGeneratePayroll}>
      Generate Payroll
    </button>
  </div>
</div>

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <p>Total Employees</p>
            <h2>{totalEmployees}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p>Total Payroll</p>
           <h2>Rs. {totalPayroll.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p>Total Overtime Pay</p>
            <h2>Rs. {totalOvertimePay.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p>Pending Payments</p>
            <h2>{pendingPayments}</h2>
          </div>
        </div>
        </div>

        <div className="section-title">
  <h2>Employee Payroll</h2>
  <p>Salary, overtime and deduction details</p>
</div>

<input
  type="text"
  placeholder="Search employee..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

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

<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="All">All Status</option>
  <option value="Pending">Pending</option>
  <option value="Paid">Paid</option>
</select>

<div className="employee-table-container">
  <table className="employee-table">
    <thead>
      <tr>
        <th>Employee</th>
        <th>Department</th>
        <th>Scheduled Days</th>
        <th>Working Hours</th>
        <th>Basic Salary</th>
        <th>OT Hours</th>
        <th>OT Pay</th>
        <th>Deductions</th>
        <th>Net Salary</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
     {filteredPayrollRecords.map((record) => (
        <tr key={record.id}>
          <td>
            <strong>{record.name}</strong>
            <small>{record.employeeId}</small>
          </td>

          <td>{record.department || "-"}</td>

<td>
  {record.scheduledShiftDays ?? 0} days
</td>

<td>
  {Number(record.workingHours || 0).toFixed(2)}h
</td>

<td>
  Rs. {Number(record.basicSalary || 0).toLocaleString()}
</td>

<td>
  {Number(record.overtimeHours || 0).toFixed(2)}h
</td>
          <td>Rs. {record.overtimePay.toLocaleString()}</td>
          <td>Rs. {record.deductions.toLocaleString()}</td>
          <td>Rs. {record.netSalary.toLocaleString()}</td>
          <td>
  {record.status === "Pending" ? (
    <button
      className="payroll-pay-btn"
      onClick={() =>
  handleMarkAsPaid(record.id, record.month)
}
    >
      Mark as Paid
    </button>
  ) : (
    <span className="payroll-status-paid">Paid</span>
  )}
</td>
        </tr>
      ))}

      {filteredPayrollRecords.length === 0 && (
  <tr>
    <td
      colSpan="10"
      style={{ textAlign: "center", padding: "20px" }}
    >
      No payroll records found
    </td>
  </tr>
)}

    </tbody>
  </table>
</div>

      </div>
    
  );
}

export default Payroll;