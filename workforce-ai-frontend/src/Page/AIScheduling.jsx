import { useEffect, useState } from "react";

function AIScheduling() {
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

  const [department, setDepartment] = useState("");
  const [weekStartDate, setWeekStartDate] = useState("");

  const [weeklyData, setWeeklyData] = useState(null);
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [loadingSavedSchedules, setLoadingSavedSchedules] = useState(false);
  const [viewSavedDepartment, setViewSavedDepartment] = useState("");

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const getWeekEndDate = (startDate) => {
  if (!startDate) return "";

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return [
    end.getFullYear(),
    String(end.getMonth() + 1).padStart(2, "0"),
    String(end.getDate()).padStart(2, "0"),
  ].join("-");
};

const loadSavedSchedules = async () => {
  if (!weekStartDate) {
    setSavedSchedules([]);
    return;
  }

  setLoadingSavedSchedules(true);

  try {
    const response = await fetch(
      "https://fairwork-hfg5sscn.b4a.run/api/ai-schedules"
    );

    if (!response.ok) {
      throw new Error("Failed to load saved schedules");
    }

    const data = await response.json();

    const weekEndDate = getWeekEndDate(weekStartDate);

    const currentWeekSchedules = data.filter(
      (item) =>
        item.date >= weekStartDate &&
        item.date <= weekEndDate
    );

    setSavedSchedules(currentWeekSchedules);
  } catch (error) {
    console.error("Saved schedule load error:", error);
    setSavedSchedules([]);
  } finally {
    setLoadingSavedSchedules(false);
  }
};

useEffect(() => {
  setViewSavedDepartment("");
  loadSavedSchedules();
}, [weekStartDate]);

  // =====================================================
  // GENERATE WEEKLY AI SCHEDULE
  // =====================================================

  const handleGenerateWeeklySchedule = async () => {
    if (!department || !weekStartDate) {
      alert("Please select Department and Week Start Date");
      return;
    }

    const selectedDate = new Date(
      `${weekStartDate}T00:00:00`
    );

    if (selectedDate.getDay() !== 1) {
      alert("Week Start Date must be a Monday");
      return;
    }

    setGenerating(true);
    setWeeklyData(null);

    try {
      const response = await fetch(
        "https://fairwork-hfg5sscn.b4a.run/api/ai/generate-weekly-schedule",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            department,
            weekStartDate,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Unable to generate weekly AI schedule.";

        try {
          const errorData = await response.json();

          message =
            errorData.message ||
            errorData.error ||
            message;
        } catch {
          // Keep default message
        }

        throw new Error(message);
      }

      const data = await response.json();

      setWeeklyData(data);
    } catch (error) {
      console.error(
        "Weekly AI schedule error:",
        error
      );

      alert(error.message);
    } finally {
      setGenerating(false);
    }
  };

  // =====================================================
  // CONFIRM + SAVE WEEKLY SCHEDULE
  // =====================================================

  const handleConfirmWeeklySchedule = async () => {
    if (
      !weeklyData ||
      !weeklyData.schedule ||
      weeklyData.schedule.length === 0
    ) {
      alert("Generate a weekly schedule first");
      return;
    }

    const confirmed = window.confirm(
      `Confirm and save the ${weeklyData.department} schedule for ${weeklyData.weekStartDate} to ${weeklyData.weekEndDate}?`
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "https://fairwork-hfg5sscn.b4a.run/api/ai-schedules/confirm-weekly",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            department: weeklyData.department,
            weekStartDate:
              weeklyData.weekStartDate,
            schedule: weeklyData.schedule,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Failed to save weekly schedule.";

        try {
          const errorData = await response.json();

          message =
            errorData.message ||
            errorData.error ||
            message;
        } catch {
          // Keep default message
        }

        throw new Error(message);
      }

      const savedResult = await response.json();

alert(
  `Weekly schedule saved successfully! ${savedResult.length} schedule records saved.`
);

await loadSavedSchedules();
setWeeklyData(null);
    } catch (error) {
      console.error(
        "Weekly schedule save error:",
        error
      );

      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    return new Date(
      `${dateValue}T00:00:00`
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hourValue, minuteValue] =
      time.split(":");

    let hour = Number(hourValue);

    const period =
      hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minuteValue} ${period}`;
  };

  const getShiftShortName = (shiftType) => {
    switch (shiftType) {
      case "Full Day":
        return "Full Day";

      case "Half Day Morning":
        return "Half AM";

      case "Half Day Evening":
        return "Half PM";

      case "Morning":
        return "Morning";

      case "Evening":
        return "Evening";

      case "LEAVE":
        return "Leave";

      case "OFF":
        return "OFF";

      default:
        return shiftType || "-";
    }
  };

  const getShiftTime = (shiftType) => {
  switch (shiftType) {
    case "Full Day":
      return "06:00 AM - 11:00 PM";

    case "Half Day Morning":
      return "06:00 AM - 11:00 AM";

    case "Half Day Evening":
      return "04:00 PM - 11:00 PM";

    case "Morning":
      return "06:00 AM - 03:00 PM";

    case "Evening":
      return "02:00 PM - 11:00 PM";

    case "OFF":
      return "OFF";

    case "LEAVE":
      return "LEAVE";

    default:
      return "";
  }
};

  const dayOrder = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const dayLabels = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  };

  const selectedSavedSchedules = viewSavedDepartment
  ? savedSchedules.filter(
      (item) => item.department === viewSavedDepartment
    )
  : [];

const savedGroupedEmployees = Object.values(
  selectedSavedSchedules.reduce((groups, item) => {
    if (!groups[item.employeeId]) {
      groups[item.employeeId] = {
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        days: {},
      };
    }

    const date = new Date(`${item.date}T00:00:00`);

    const day = dayOrder[
      date.getDay() === 0 ? 6 : date.getDay() - 1
    ];

    groups[item.employeeId].days[day] = item;

    return groups;
  }, {})
);

  // =====================================================
  // GROUP SCHEDULE BY EMPLOYEE
  // =====================================================

  const groupedEmployees = weeklyData
    ? Object.values(
        weeklyData.schedule.reduce(
          (groups, item) => {
            if (!groups[item.employeeId]) {
              groups[item.employeeId] = {
                employeeId: item.employeeId,
                employeeName:
                  item.employeeName,
                role: item.role,
                department:
                  item.department,
                days: {},
              };
            }

            groups[item.employeeId].days[
              item.day
            ] = item;

            return groups;
          },
          {}
        )
      )
    : [];

  // =====================================================
  // SUMMARY
  // =====================================================

  const workingShiftCount =
    weeklyData?.schedule?.filter(
      (item) =>
        item.shiftType !== "OFF" &&
        item.shiftType !== "LEAVE"
    ).length || 0;

  const leaveCount =
    weeklyData?.schedule?.filter(
      (item) => item.shiftType === "LEAVE"
    ).length || 0;

  const fullDayCount =
    weeklyData?.schedule?.filter(
      (item) => item.shiftType === "Full Day"
    ).length || 0;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="ai-scheduling-page">
      <div className="page-header">
        <div>
          <h1>
            AI Weekly Workforce Scheduling
          </h1>

          <p>
            Select a department and Monday.
            AI will generate the complete
            Monday to Sunday workforce roster.
          </p>
        </div>
      </div>

      {/* CONTROLS */}

      <div className="ai-schedule-controls">
        <div className="form-group">
          <label>Department</label>

          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setWeeklyData(null);
            }}
          >
            <option value="">
              Select Department
            </option>

            {departments.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            Week Start Date (Monday)
          </label>

          <input
            type="date"
            value={weekStartDate}
            onChange={(e) => {
              setWeekStartDate(
                e.target.value
              );
              setWeeklyData(null);
            }}
          />
        </div>
      </div>

      <button
        className="generate-ai-btn"
        onClick={
          handleGenerateWeeklySchedule
        }
        disabled={generating}
      >
        {generating
          ? "AI Generating Weekly Roster..."
          : "Generate Weekly AI Schedule"}
      </button>

      {weekStartDate && (
  <div
    className="generated-schedule-box"
    style={{ marginTop: "24px" }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        marginBottom: "18px",
      }}
    >
      <div>
        <h3>Saved Weekly Schedules</h3>
        <p>
          {formatDate(weekStartDate)} -{" "}
          {formatDate(getWeekEndDate(weekStartDate))}
        </p>
      </div>

      <strong>
        {
          departments.filter((dept) =>
            savedSchedules.some(
              (schedule) => schedule.department === dept
            )
          ).length
        }{" "}
        / {departments.length} Departments Saved
      </strong>
    </div>

    {loadingSavedSchedules ? (
      <p>Loading saved schedules...</p>
    ) : (
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "10px",
        }}
      >
        {departments.map((dept) => {
          const departmentSchedules =
            savedSchedules.filter(
              (schedule) =>
                schedule.department === dept
            );

          const isSaved =
            departmentSchedules.length > 0;

          return (
            <button
              key={dept}
              type="button"
              onClick={() => {
              if (isSaved) {
                setDepartment(dept);
                setWeeklyData(null);
                setViewSavedDepartment(dept);
              }
            }}
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: isSaved
                  ? "pointer"
                  : "default",
                textAlign: "left",
              }}
            >
              <strong>{dept}</strong>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                }}
              >
                {isSaved
                  ? `✓ Saved (${departmentSchedules.length})`
                  : "Not Saved"}
              </div>
            </button>
          );
        })}
      </div>
    )}
  </div>
)}

{viewSavedDepartment && savedGroupedEmployees.length > 0 && (
  <div
    className="generated-schedule-box"
    style={{ marginTop: "24px" }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h3>
          {viewSavedDepartment} - Saved Weekly Roster
        </h3>

        <p>
          {formatDate(weekStartDate)} -{" "}
          {formatDate(getWeekEndDate(weekStartDate))}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setViewSavedDepartment("")}
      >
        Close
      </button>
    </div>

    <div
      style={{
        overflowX: "auto",
        marginTop: "20px",
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: "1050px",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "14px" }}>
              Employee
            </th>

            {dayOrder.map((day) => (
              <th
                key={day}
                style={{
                  textAlign: "center",
                  padding: "14px 10px",
                }}
              >
                {dayLabels[day]}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {savedGroupedEmployees.map((employee) => (
            <tr key={employee.employeeId}>
              <td style={{ padding: "14px" }}>
                <strong>{employee.employeeName}</strong>

                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginTop: "4px",
                  }}
                >
                  {employee.employeeId}
                </div>
              </td>

              {dayOrder.map((day) => {
                const shift = employee.days[day];

                return (
                  <td
                    key={day}
                    style={{
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    {shift ? (
  <div>
    <strong>
      {getShiftShortName(shift.shift)}
    </strong>

    {shift.shift !== "OFF" &&
      shift.shift !== "LEAVE" && (
        <div
          style={{
            fontSize: "11px",
            opacity: 0.7,
            marginTop: "5px",
            whiteSpace: "nowrap",
          }}
        >
          {getShiftTime(shift.shift)}
        </div>
      )}
  </div>
) : (
  "-"
)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

      {/* WEEKLY RESULT */}

      {weeklyData && (
        <div
          className="generated-schedule-box"
          style={{ marginTop: "28px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3>
                {weeklyData.department}
                {" - "}
                Weekly AI Roster
              </h3>

              <p>
                {formatDate(
                  weeklyData.weekStartDate
                )}
                {" - "}
                {formatDate(
                  weeklyData.weekEndDate
                )}
              </p>
            </div>

            <div>
              <strong>
                {
                  weeklyData.totalEmployees
                }{" "}
                Employees
              </strong>
            </div>
          </div>

          {/* SUMMARY CARDS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "12px",
              marginTop: "22px",
              marginBottom: "24px",
            }}
          >
            <div className="ai-recommendations">
              <strong>
                {
                  groupedEmployees.length
                }
              </strong>
              <p>Scheduled Staff</p>
            </div>

            <div className="ai-recommendations">
              <strong>
                {workingShiftCount}
              </strong>
              <p>Working Shifts</p>
            </div>

            <div className="ai-recommendations">
              <strong>
                {fullDayCount}
              </strong>
              <p>Full Days</p>
            </div>

            <div className="ai-recommendations">
              <strong>
                {leaveCount}
              </strong>
              <p>Approved Leave</p>
            </div>
          </div>

          {/* WEEKLY TABLE */}

          <div
            style={{
              overflowX: "auto",
              marginTop: "20px",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: "1050px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px",
                    }}
                  >
                    Employee
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px",
                    }}
                  >
                    Role
                  </th>

                  {dayOrder.map((day) => (
                    <th
                      key={day}
                      style={{
                        textAlign: "center",
                        padding: "14px 10px",
                      }}
                    >
                      {dayLabels[day]}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {groupedEmployees.map(
                  (employee) => (
                    <tr
                      key={
                        employee.employeeId
                      }
                    >
                      <td
                        style={{
                          padding: "14px",
                        }}
                      >
                        <strong>
                          {
                            employee.employeeName
                          }
                        </strong>

                        <div
                          style={{
                            fontSize: "12px",
                            opacity: 0.7,
                            marginTop: "4px",
                          }}
                        >
                          {
                            employee.employeeId
                          }
                        </div>
                      </td>

                      <td
                        style={{
                          padding: "14px",
                        }}
                      >
                        {employee.role}
                      </td>

                      {dayOrder.map(
                        (day) => {
                          const shift =
                            employee.days[
                              day
                            ];

                          return (
                            <td
                              key={day}
                              style={{
                                padding:
                                  "10px",
                                textAlign:
                                  "center",
                                verticalAlign:
                                  "top",
                              }}
                            >
                              {shift ? (
                                <div
                                  title={
                                    shift.reason
                                  }
                                >
                                  <strong>
                                    {getShiftShortName(
                                      shift.shiftType
                                    )}
                                  </strong>

                                  {shift.startTime &&
                                    shift.endTime && (
                                      <div
                                        style={{
                                          fontSize:
                                            "11px",
                                          opacity:
                                            0.7,
                                          marginTop:
                                            "5px",
                                        }}
                                      >
                                        {formatTime(
                                          shift.startTime
                                        )}
                                        <br />
                                        {formatTime(
                                          shift.endTime
                                        )}
                                      </div>
                                    )}
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                          );
                        }
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* AI NOTES */}

          {weeklyData.notes &&
            weeklyData.notes.length > 0 && (
              <div
                className="ai-recommendations"
                style={{
                  marginTop: "24px",
                }}
              >
                <h4>
                  AI Scheduling Notes
                </h4>

                {weeklyData.notes.map(
                  (note, index) => (
                    <div
                      key={index}
                      style={{
                        marginTop: "8px",
                      }}
                    >
                      ✓ {note}
                    </div>
                  )
                )}
              </div>
            )}

          {/* CONFIRM */}

          <button
            className="assign-recommended-btn"
            onClick={
              handleConfirmWeeklySchedule
            }
            disabled={saving}
            style={{
              marginTop: "24px",
            }}
          >
            {saving
              ? "Saving Weekly Schedule..."
              : "Confirm & Save Weekly Schedule"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AIScheduling;