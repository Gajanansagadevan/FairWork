import { useState } from "react";

function Settings() {

  const savedGeneralSettings =
  JSON.parse(localStorage.getItem("generalSettings")) || {};

const [shiftDuration, setShiftDuration] = useState(
  savedGeneralSettings.shiftDuration || "8"
);

const [workingDays, setWorkingDays] = useState(
  savedGeneralSettings.workingDays || "Monday - Saturday"
);

const handleSaveGeneralSettings = () => {
  localStorage.setItem(
    "generalSettings",
    JSON.stringify({
      shiftDuration,
      workingDays,
    })
  );

  alert("General settings saved successfully!");
};


const savedAttendanceSettings =
  JSON.parse(localStorage.getItem("attendanceSettings")) || {};

const [shiftStartTime, setShiftStartTime] = useState(
  savedAttendanceSettings.shiftStartTime || "06:00"
);

const [lateGracePeriod, setLateGracePeriod] = useState(
  savedAttendanceSettings.lateGracePeriod || "10"
);

const [standardWorkingHours, setStandardWorkingHours] = useState(
  savedAttendanceSettings.standardWorkingHours || "8"
);

const handleSaveAttendanceSettings = () => {
  localStorage.setItem(
    "attendanceSettings",
    JSON.stringify({
      shiftStartTime,
      lateGracePeriod,
      standardWorkingHours,
    })
  );

  alert("Attendance settings saved successfully!");
};

const savedPayrollSettings =
  JSON.parse(localStorage.getItem("payrollSettings")) || {};

const [overtimeMultiplier, setOvertimeMultiplier] = useState(
  savedPayrollSettings.overtimeMultiplier || "1.5"
);

const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState(
  savedPayrollSettings.workingDaysPerMonth || "30"
);

const [dailyWorkingHours, setDailyWorkingHours] = useState(
  savedPayrollSettings.dailyWorkingHours || "8"
);

const handleSavePayrollSettings = () => {
  localStorage.setItem(
    "payrollSettings",
    JSON.stringify({
      overtimeMultiplier,
      workingDaysPerMonth,
      dailyWorkingHours,
    })
  );

  alert("Payroll settings saved successfully!");
};

const savedAISettings =
  JSON.parse(localStorage.getItem("aiSettings")) || {};

const [autoScheduling, setAutoScheduling] = useState(
  savedAISettings.autoScheduling ?? true
);

const [aiRecommendations, setAiRecommendations] = useState(
  savedAISettings.aiRecommendations ?? true
);

const [maxRecommendedEmployees, setMaxRecommendedEmployees] = useState(
  savedAISettings.maxRecommendedEmployees || "2"
);

const handleSaveAISettings = () => {
  localStorage.setItem(
    "aiSettings",
    JSON.stringify({
      autoScheduling,
      aiRecommendations,
      maxRecommendedEmployees,
    })
  );

  alert("AI settings saved successfully!");
};

    return (
        <div className="settings-page">
            <div className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>
                        Manage system preferences and application settings
                        </p>
                </div>
            </div>

            <div className="settings-grid">

 <div className="settings-card">
  <h3>⚙️ General Settings</h3>

  <div className="settings-form-group">
  <label>Default Shift Duration</label>

  <select
    value={shiftDuration}
    onChange={(e) => setShiftDuration(e.target.value)}
  >
    <option value="6">6 Hours</option>
    <option value="8">8 Hours</option>
    <option value="10">10 Hours</option>
    <option value="12">12 Hours</option>
  </select>
</div>

  <div className="settings-form-group">
    <label>Working Days</label>

    <select
      value={workingDays}
      onChange={(e) => setWorkingDays(e.target.value)}
    >
      <option>Monday - Friday</option>
      <option>Monday - Saturday</option>
      <option>All Days</option>
    </select>
  </div>

  <button
    className="settings-save-btn"
    onClick={handleSaveGeneralSettings}
  >
    Save Settings
  </button>
</div>

  <div className="settings-card">
  <h3>🕒 Attendance Settings</h3>

  <div className="settings-form-group">
    <label>Shift Start Time</label>

    <input
      type="time"
      value={shiftStartTime}
      onChange={(e) => setShiftStartTime(e.target.value)}
    />
  </div>

  <div className="settings-form-group">
    <label>Late Grace Period</label>

    <select
      value={lateGracePeriod}
      onChange={(e) => setLateGracePeriod(e.target.value)}
    >
      <option value="5">5 Minutes</option>
      <option value="10">10 Minutes</option>
      <option value="15">15 Minutes</option>
      <option value="30">30 Minutes</option>
    </select>
  </div>

  <div className="settings-form-group">
    <label>Standard Working Hours</label>

    <select
      value={standardWorkingHours}
      onChange={(e) => setStandardWorkingHours(e.target.value)}
    >
      <option value="1">1 Hour</option>
      <option value="6">6 Hours</option>
      <option value="8">8 Hours</option>
      <option value="10">10 Hours</option>
      <option value="12">12 Hours</option>
    </select>
  </div>

  <button
    className="settings-save-btn"
    onClick={handleSaveAttendanceSettings}
  >
    Save Attendance Settings
  </button>
</div>

  <div className="settings-card">
  <h3>💳 Payroll Settings</h3>

  <div className="settings-form-group">
    <label>Overtime Multiplier</label>

    <select
      value={overtimeMultiplier}
      onChange={(e) => setOvertimeMultiplier(e.target.value)}
    >
      <option value="1.25">1.25x</option>
      <option value="1.5">1.5x</option>
      <option value="1.75">1.75x</option>
      <option value="2">2x</option>
    </select>
  </div>

  <div className="settings-form-group">
    <label>Working Days per Month</label>

    <select
      value={workingDaysPerMonth}
      onChange={(e) => setWorkingDaysPerMonth(e.target.value)}
    >
      <option value="26">26 Days</option>
      <option value="28">28 Days</option>
      <option value="30">30 Days</option>
    </select>
  </div>

  <div className="settings-form-group">
    <label>Daily Working Hours</label>

    <select
      value={dailyWorkingHours}
      onChange={(e) => setDailyWorkingHours(e.target.value)}
    >
      <option value="6">6 Hours</option>
      <option value="8">8 Hours</option>
      <option value="10">10 Hours</option>
      <option value="12">12 Hours</option>
    </select>
  </div>

  <button
    className="settings-save-btn"
    onClick={handleSavePayrollSettings}
  >
    Save Payroll Settings
  </button>
</div>

 <div className="settings-card">
  <h3>✨ AI Settings</h3>

  <div className="settings-form-group">
    <label>Auto Scheduling</label>

    <select
      value={autoScheduling ? "enabled" : "disabled"}
      onChange={(e) =>
        setAutoScheduling(e.target.value === "enabled")
      }
    >
      <option value="enabled">Enabled</option>
      <option value="disabled">Disabled</option>
    </select>
  </div>

  <div className="settings-form-group">
    <label>AI Recommendations</label>

    <select
      value={aiRecommendations ? "enabled" : "disabled"}
      onChange={(e) =>
        setAiRecommendations(e.target.value === "enabled")
      }
    >
      <option value="enabled">Enabled</option>
      <option value="disabled">Disabled</option>
    </select>
  </div>

  <div className="settings-form-group">
    <label>Maximum Recommended Employees</label>

    <select
      value={maxRecommendedEmployees}
      onChange={(e) =>
        setMaxRecommendedEmployees(e.target.value)
      }
    >
      <option value="1">1 Employee</option>
      <option value="2">2 Employees</option>
      <option value="3">3 Employees</option>
      <option value="4">4 Employees</option>
      <option value="5">5 Employees</option>
    </select>
  </div>

  <button
    className="settings-save-btn"
    onClick={handleSaveAISettings}
  >
    Save AI Settings
  </button>
</div>

</div>

        </div>
    );
}

export default Settings;