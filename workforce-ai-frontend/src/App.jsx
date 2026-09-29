import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";

import Employees from "./Page/Employees";
import Shifts  from "./Page/Shifts";
import Attendance from "./Page/Attendance";
import Payroll from "./Page/Payroll";
import Leave from "./Page/Leave";
import Reports from "./Page/Reports";
import AIScheduling from "./Page/AIScheduling";
import AIAssistant from "./Page/AIAssistant";
import Settings from "./Page/Settings";


function Dashboard() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const [employees, setEmployees] = useState([]);

useEffect(() => {
  fetch("http://localhost:8080/api/employees")
    .then((response) => response.json())
    .then((data) => {
      setEmployees(data);
    })
    .catch((error) => {
      console.error(
        "Error fetching employees for dashboard:",
        error
      );
    });
}, []);

const totalEmployees = employees.length;

const [attendanceRecords, setAttendanceRecords] = useState([]);

useEffect(() => {
  fetch("http://localhost:8080/api/attendance")
    .then((response) => response.json())
    .then((data) => {
      setAttendanceRecords(data);
    })
    .catch((error) => {
      console.error(
        "Error fetching attendance for dashboard:",
        error
      );
    });
}, []);

const [payrollRecords, setPayrollRecords] = useState([]);

useEffect(() => {
  fetch("http://localhost:8080/api/payroll")
    .then((response) => response.json())
    .then((data) => {
      setPayrollRecords(data);
    })
    .catch((error) => {
      console.error(
        "Error fetching payroll for dashboard:",
        error
      );
    });
}, []);

  const cycleStartDate =
  localStorage.getItem("payrollCycleStartDate") ||
  "2026-09-28";

const getCycleEndDate = (startDate) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(start);

  end.setDate(end.getDate() + 27);

  return [
    end.getFullYear(),
    String(end.getMonth() + 1).padStart(2, "0"),
    String(end.getDate()).padStart(2, "0"),
  ].join("-");
};

const cycleEndDate =
  getCycleEndDate(cycleStartDate);

const cycleLabel =
  `${cycleStartDate}_to_${cycleEndDate}`;

const currentCyclePayroll =
  payrollRecords.filter(
    (record) => record.month === cycleLabel
  );

const totalPayroll =
  currentCyclePayroll.reduce(
    (total, record) =>
      total + Number(record.netSalary || 0),
    0
  );

  const [aiSchedules, setAiSchedules] = useState([]);

useEffect(() => {
  fetch("http://localhost:8080/api/ai-schedules")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch AI schedules");
      }

      return response.json();
    })
    .then((data) => {
      const groupedSchedules = [];

      data.forEach((item) => {
        const existingSchedule = groupedSchedules.find(
          (schedule) =>
            schedule.date === item.date &&
            schedule.shift === item.shift &&
            schedule.department === item.department
        );

        const employee = {
          id: item.employeeId,
          name: item.employeeName,
        };

        if (existingSchedule) {
          existingSchedule.employees.push(employee);
        } else {
          groupedSchedules.push({
            id: item.id,
            date: item.date,
            shift: item.shift,
            department: item.department,
            employees: [employee],
          });
        }
      });

      setAiSchedules(groupedSchedules);
    })
    .catch((error) => {
      console.error(
        "Error fetching AI schedules for dashboard:",
        error
      );
    });
}, []);

const currentCycleSchedules =
  aiSchedules.filter(
    (schedule) =>
      schedule.date >= cycleStartDate &&
      schedule.date <= cycleEndDate
  );

const savedSchedules =
  currentCycleSchedules.length;

const shortageSchedule =
  currentCycleSchedules.find(
    (schedule) =>
      !schedule.employees ||
      schedule.employees.length < 2
  );

const upcomingWorkforceMessage =
  currentCycleSchedules.length >= 3
    ? "AI predicts higher workforce demand based on the number of upcoming schedules."
    : "Current workforce demand appears stable based on saved schedules.";

const [leaveRequests, setLeaveRequests] = useState([]);

useEffect(() => {
  fetch("http://localhost:8080/api/leaves")
    .then((response) => response.json())
    .then((data) => {
      setLeaveRequests(data);
    })
    .catch((error) => {
      console.error(
        "Error fetching leave requests for dashboard:",
        error
      );
    });
}, []);

const pendingLeaveCount = leaveRequests.filter(
  (leave) => leave.status === "Pending"
).length;

const today = new Date();

const currentDate = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const todayAttendanceRecords = attendanceRecords.filter(
  (record) => record.date === currentDate
);

const todayPresent = todayAttendanceRecords.filter(
  (record) =>
    record.status === "Present" ||
    record.status === "Late"
).length;

const attendanceAnomalyCount = todayAttendanceRecords.filter(
  (record) =>
    record.status === "Absent" ||
    record.status === "Late"
).length;

const highOvertimeEmployees = todayAttendanceRecords.filter(
  (record) => {
    if (!record.overtime || record.overtime === "-") {
      return false;
    }

    const hourMatch = record.overtime.match(/(\d+)h/);
    const minuteMatch = record.overtime.match(/(\d+)m/);

    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;

    const totalOvertimeMinutes =
      hours * 60 + minutes;

    return totalOvertimeMinutes >= 120;
  }
);

const notificationCount =
  pendingLeaveCount + attendanceAnomalyCount;

  const currentHour = new Date().getHours();

let greeting = "Good Evening";

if (currentHour < 12) {
  greeting = "Good Morning";
} else if (currentHour < 18) {
  greeting = "Good Afternoon";
}

  return (
    <main className="main-content">

      <header className="header">
        <div>
          <h1>Dashboard</h1>
          <p>AI Workforce Management System</p>
        </div>

        <div className="user-section">
          <div
  className="notification-wrapper"
  onClick={() => setShowNotifications(!showNotifications)}
>
  <span className="notification">🔔</span>

  {notificationCount > 0 && (
    <span className="notification-badge">
      {notificationCount}
    </span>
  )}

  {showNotifications && (
    <div className="notification-dropdown">
      <h4>Notifications</h4>

      <div className="notification-item">
        <span>Pending Leave Requests</span>
        <strong>{pendingLeaveCount}</strong>
      </div>

      <div className="notification-item">
        <span>Attendance Anomalies</span>
        <strong>{attendanceAnomalyCount}</strong>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate("/leave");
        }}
      >
        View Leave Requests
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate("/attendance");
        }}
      >
        View Attendance
      </button>
    </div>
  )}
</div>

          <div className="user-info">
            <strong>Admin</strong>
            <small>Administrator</small>
          </div>

          <div className="profile">A</div>
        </div>
      </header>

      <section className="dashboard-content">

        <div className="welcome">
          <div>
            <h2>{greeting}, Admin 👋</h2>
            <p>
              Here's what's happening with your workforce today.
            </p>
          </div>

          <button
            className="ai-button"
            onClick={() => navigate("/ai-assistant")}
          >
            🤖 AI Insights
          </button>
        </div>

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div>
              <p>Total Employees</p>
              <h2>{totalEmployees}</h2>
              <span>Active workforce records</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div>
              <p>Present Today</p>
              <h2>{todayPresent}</h2>
              <span>Present + Late employees</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
             <p>Payroll Cost</p>

<h2>
  Rs. {totalPayroll.toLocaleString()}
</h2>

<span>
  4-Week Cycle
</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div>
              <p>AI Schedules</p>
              <h2>{savedSchedules}</h2>
              <span>Saved schedules</span>
            </div>
          </div>

        </div>

        <div className="section-title">
          <h2>AI Insights</h2>
          <p>Intelligent workforce recommendations</p>
        </div>

        <div className="insights-grid">

          <div className="insight-card">
            <div className="insight-header">
              <span>🤖</span>
              <h3>Staff Shortage</h3>
            </div>

            <p>
              {shortageSchedule
                ? `AI detected a possible staff shortage in the ${shortageSchedule.department} Department for the ${shortageSchedule.shift} shift.`
                : "No staff shortage detected in saved AI schedules."}
            </p>

            <button
              onClick={() => navigate("/ai-scheduling")}
            >
              View Recommendation →
            </button>
          </div>

          <div className="insight-card">
            <div className="insight-header">
              <span>⚠️</span>
              <h3>High Overtime</h3>
            </div>

            <p>
              {highOvertimeEmployees.length > 0
                ? `${highOvertimeEmployees.length} employee(s) have high overtime hours and may require review.`
                : "No unusually high overtime detected."}
            </p>

            <button
              onClick={() => navigate("/attendance")}
            >
              Review Employees →
            </button>

          </div>

          <div className="insight-card">
            <div className="insight-header">
              <span>📊</span>
              <h3>Workforce Prediction</h3>
            </div>

            <p>
              {upcomingWorkforceMessage}
            </p>

            <button
              onClick={() => navigate("/reports")}
            >
              View Prediction →
            </button>
          </div>

        </div>

      </section>

    </main>
  );
}


function Layout() {
  const location = useLocation();

  const isActive = (path) => {
  return location.pathname === path;
};

  return (
    <div className="app">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="logo">
          <h2>WorkForce AI</h2>
          <span>Smart Management</span>
        </div>

        <nav className="navigation">

          <Link
            to="/"
             className={`nav-item ${isActive("/") ? "active" : ""}`}
          >
            🏠 Dashboard
          </Link>

          <Link
            to="/employees"
             className={`nav-item ${isActive("/employees") ? "active" : ""}`}
          >
            👥 Employees
          </Link>

          <Link
            to="/ai-scheduling"
            className={`nav-item ${isActive("/ai-scheduling") ? "active" : ""}`}
          >
            🤖 AI Scheduling
          </Link>

         <Link
            to="/attendance"
           className={`nav-item ${isActive("/attendance") ? "active" : ""}`}
          >
            ⏰ Attendance
          </Link>

          <Link
            to="/shifts"
            className={`nav-item ${isActive("/shifts") ? "active" : ""}`}
          >
            🔄 Shifts
          </Link>

          <Link
            to="/payroll"
            className={`nav-item ${isActive("/payroll") ? "active" : ""}`}
          >
            💰 Payroll
          </Link>

          <Link
            to="/leave"
            className={`nav-item ${isActive("/leave") ? "active" : ""}`}
          >
            🏖️ Leave
          </Link>

          <Link
            to="/reports"
            className={`nav-item ${isActive("/reports") ? "active" : ""}`}
          >
            📊 Reports
          </Link>

          <Link
            to="/ai-assistant"
            className={`nav-item ${isActive("/ai-assistant") ? "active" : ""}`}
          >
            💬 AI Assistant
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <Link
            to="/settings"
            className={`nav-item ${isActive("/settings") ? "active" : ""}`}
          >
            ⚙️ Settings
          </Link>

          <button
  className="nav-item logout"
  onClick={() => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {
      navigate("/");
    }
  }}
>
  <span>🚪</span>
  Logout
</button>

        </div>

      </aside>


      {/* Pages */}

      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/employees" 
        element={<main className="main-content"><Employees /></main>} />
        <Route path="/attendance"
        element={<main className="main-content"><Attendance /></main>}/>
        <Route path="/shifts" 
        element={<main className="main-content"><Shifts /></main>} />
       <Route path="/payroll"
        element={<main className="main-content"><Payroll /></main>} />
        <Route path="/leave"
        element={<main className="main-content"><Leave /></main>} />
        <Route path ="/reports"
        element={<main className="main-content"><Reports /></main>} />
        <Route path="/ai-scheduling"
        element={<main className="main-content"><AIScheduling /></main>} />
        <Route path="/ai-assistant"
        element={<main className="main-content"><AIAssistant /></main>} />
        <Route path="/settings"
        element={<main className="main-content"><Settings /></main>} />
      

      </Routes>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;