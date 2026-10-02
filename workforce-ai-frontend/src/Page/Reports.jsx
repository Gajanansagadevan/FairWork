import { useEffect, useState } from "react";

function Reports() {
  const [cycleStartDate, setCycleStartDate] = useState(() => {
    return (
      localStorage.getItem("payrollCycleStartDate") ||
      "2026-09-28"
    );
  });

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    fetch("https://fairwork-mr3yo4on.b4a.run/api/attendance")
      .then((response) => response.json())
      .then((data) => setAttendanceRecords(data))
      .catch((error) =>
        console.error(
          "Error fetching attendance for reports:",
          error
        )
      );
  }, []);

  useEffect(() => {
    fetch("https://fairwork-mr3yo4on.b4a.run/api/payroll")
      .then((response) => response.json())
      .then((data) => setPayrollRecords(data))
      .catch((error) =>
        console.error(
          "Error fetching payroll for reports:",
          error
        )
      );
  }, []);

  useEffect(() => {
    fetch("https://fairwork-mr3yo4on.b4a.run/api/leaves")
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
      .catch((error) =>
        console.error(
          "Error fetching leave requests for reports:",
          error
        )
      );
  }, []);

  // =========================
  // 4-WEEK PAYROLL CYCLE
  // =========================

  const getCycleEndDate = () => {
    if (!cycleStartDate) return "";

    const start = new Date(`${cycleStartDate}T00:00:00`);
    const end = new Date(start);

    end.setDate(end.getDate() + 27);

    return [
      end.getFullYear(),
      String(end.getMonth() + 1).padStart(2, "0"),
      String(end.getDate()).padStart(2, "0"),
    ].join("-");
  };

  const cycleEndDate = getCycleEndDate();

  const cycleLabel =
    cycleStartDate && cycleEndDate
      ? `${cycleStartDate}_to_${cycleEndDate}`
      : "";

  const handleCycleChange = (value) => {
    if (!value) {
      return;
    }

    const selectedDate = new Date(`${value}T00:00:00`);

    if (selectedDate.getDay() !== 1) {
      alert("Payroll cycle must start on a Monday.");
      return;
    }

    setCycleStartDate(value);

    localStorage.setItem(
      "payrollCycleStartDate",
      value
    );
  };

  const isDateInsideCycle = (date) => {
    if (!date || !cycleStartDate || !cycleEndDate) {
      return false;
    }

    return (
      date >= cycleStartDate &&
      date <= cycleEndDate
    );
  };

  // =========================
  // ATTENDANCE
  // =========================

  const cycleAttendance = attendanceRecords.filter(
    (record) => isDateInsideCycle(record.date)
  );

  const totalAttendanceRecords =
    cycleAttendance.length;

  const attendedRecords = cycleAttendance.filter(
    (record) =>
      record.status === "Present" ||
      record.status === "Late"
  ).length;

  const attendanceRate =
    totalAttendanceRecords > 0
      ? Math.round(
          (attendedRecords /
            totalAttendanceRecords) *
            100
        )
      : 0;

  // =========================
  // WORKING HOURS
  // =========================

  const parseDurationMinutes = (value) => {
    if (!value || value === "-") {
      return 0;
    }

    const hourMatch = value.match(/(\d+)h/i);
    const minuteMatch = value.match(/(\d+)m/i);

    const hours = hourMatch
      ? parseInt(hourMatch[1], 10)
      : 0;

    const minutes = minuteMatch
      ? parseInt(minuteMatch[1], 10)
      : 0;

    return hours * 60 + minutes;
  };

  const totalWorkingMinutes =
    cycleAttendance.reduce(
      (total, record) =>
        total +
        parseDurationMinutes(
          record.workingHours
        ),
      0
    );

  const workingHours =
    Math.floor(totalWorkingMinutes / 60);

  const workingMinutes =
    totalWorkingMinutes % 60;

  const totalWorkingHours =
    `${workingHours}h ${workingMinutes}m`;

  // =========================
  // OVERTIME
  // =========================

  const totalOvertimeMinutes =
    cycleAttendance.reduce(
      (total, record) =>
        total +
        parseDurationMinutes(record.overtime),
      0
    );

  const overtimeHours =
    Math.floor(totalOvertimeMinutes / 60);

  const overtimeMinutes =
    totalOvertimeMinutes % 60;

  const totalOvertime =
    `${overtimeHours}h ${overtimeMinutes}m`;

  // =========================
  // PAYROLL
  // =========================

  const cyclePayroll = payrollRecords.filter(
    (record) => record.month === cycleLabel
  );

  const totalPayrollEmployees =
    cyclePayroll.length;

  const pendingPayments =
    cyclePayroll.filter(
      (record) => record.status === "Pending"
    ).length;

  const paidPayments =
    cyclePayroll.filter(
      (record) => record.status === "Paid"
    ).length;

  const totalPayroll =
    cyclePayroll.reduce(
      (total, record) =>
        total + Number(record.netSalary || 0),
      0
    );

  // =========================
  // LEAVE
  // =========================

  // Include leave requests that overlap
  // any date inside the 28-day cycle.
  const cycleLeaves = leaveRequests.filter(
    (request) => {
      if (
        !request.fromDate ||
        !request.toDate
      ) {
        return false;
      }

      return (
        request.fromDate <= cycleEndDate &&
        request.toDate >= cycleStartDate
      );
    }
  );

  const approvedLeaves =
    cycleLeaves.filter(
      (request) =>
        request.status === "Approved"
    ).length;

  const pendingLeaves =
    cycleLeaves.filter(
      (request) =>
        request.status === "Pending"
    ).length;

  const rejectedLeaves =
    cycleLeaves.filter(
      (request) =>
        request.status === "Rejected"
    ).length;

  // =========================
  // LATEST ATTENDANCE DAY
  // =========================

  const latestAttendanceDate =
    cycleAttendance.length > 0
      ? cycleAttendance
          .map((record) => record.date)
          .filter(Boolean)
          .sort()
          .at(-1)
      : null;

  const latestAttendanceRecords =
    cycleAttendance.filter(
      (record) =>
        record.date === latestAttendanceDate
    );

  const presentCount =
    latestAttendanceRecords.filter(
      (record) =>
        record.status === "Present"
    ).length;

  const lateCount =
    latestAttendanceRecords.filter(
      (record) =>
        record.status === "Late"
    ).length;

  const absentCount =
    latestAttendanceRecords.filter(
      (record) =>
        record.status === "Absent"
    ).length;

  // =========================
  // CSV
  // =========================

  const exportReportCSV = () => {
    const rows = [
      [
        "Report Cycle",
        `${cycleStartDate} to ${cycleEndDate}`,
      ],
      ["Attendance Rate", `${attendanceRate}%`],
      ["Total Working Hours", totalWorkingHours],
      ["Total Overtime", totalOvertime],
      ["Total Payroll", `Rs. ${totalPayroll}`],
      ["Approved Leaves", approvedLeaves],

      [],

      ["Latest Attendance Summary"],
      ["Date", latestAttendanceDate || "-"],
      ["Present", presentCount],
      ["Late", lateCount],
      ["Absent", absentCount],

      [],

      ["Leave Summary"],
      ["Pending", pendingLeaves],
      ["Approved", approvedLeaves],
      ["Rejected", rejectedLeaves],

      [],

      ["Payroll Summary"],
      ["Total Employees", totalPayrollEmployees],
      ["Pending Payments", pendingPayments],
      ["Paid Payments", paidPayments],
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `reports-${cycleStartDate}-to-${cycleEndDate}.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Reports & Analytics</h1>

          <p>
            View workforce insights for the
            selected 4-week payroll cycle
          </p>
        </div>

        <div className="reports-header-actions">
          <div>
            <small>
              4-Week Cycle Start
            </small>

            <input
              className="reports-month-input"
              type="date"
              value={cycleStartDate}
              onChange={(e) =>
                handleCycleChange(
                  e.target.value
                )
              }
            />

            <div
              style={{
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {cycleStartDate} →{" "}
              {cycleEndDate}
            </div>
          </div>

          <button
            className="report-export-btn"
            onClick={exportReportCSV}
          >
            Export Report
          </button>
        </div>
      </div>

      <div className="reports-stats-grid">
        <div className="stat-card">
          <div>
            <p>Attendance Rate</p>
            <h2>{attendanceRate}%</h2>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p>Total Working Hours</p>
            <h2>{totalWorkingHours}</h2>
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
            <p>Total Payroll</p>

            <h2>
              Rs.{" "}
              {totalPayroll.toLocaleString()}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p>Approved Leaves</p>
            <h2>{approvedLeaves}</h2>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <div className="section-title">
          <h2>
            Latest Attendance Summary
          </h2>

          <p>
            {latestAttendanceDate
              ? `Attendance status for ${latestAttendanceDate}`
              : "No attendance records in this cycle"}
          </p>
        </div>

        <div className="attendance-summary-grid">
          <div className="stat-card">
            <p>Present</p>
            <h2>{presentCount}</h2>
          </div>

          <div className="stat-card">
            <p>Late</p>
            <h2>{lateCount}</h2>
          </div>

          <div className="stat-card">
            <p>Absent</p>
            <h2>{absentCount}</h2>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <div className="section-title">
          <h2>Leave Summary</h2>

          <p>
            Leave requests overlapping this
            4-week cycle
          </p>
        </div>

        <div className="leave-summary-grid">
          <div className="stat-card">
            <p>Pending</p>
            <h2>{pendingLeaves}</h2>
          </div>

          <div className="stat-card">
            <p>Approved</p>
            <h2>{approvedLeaves}</h2>
          </div>

          <div className="stat-card">
            <p>Rejected</p>
            <h2>{rejectedLeaves}</h2>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <div className="section-title">
          <h2>Payroll Summary</h2>

          <p>
            4-week payroll cycle payment
            overview
          </p>
        </div>

        <div className="payroll-summary-grid">
          <div className="stat-card">
            <p>Total Employees</p>
            <h2>{totalPayrollEmployees}</h2>
          </div>

          <div className="stat-card">
            <p>Pending Payments</p>
            <h2>{pendingPayments}</h2>
          </div>

          <div className="stat-card">
            <p>Paid Payments</p>
            <h2>{paidPayments}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;