import { useEffect, useRef, useState } from "react";

function AIAssistant() {

  const payrollSettings =
  JSON.parse(localStorage.getItem("payrollSettings")) || {};

const overtimeMultiplier =
  Number(payrollSettings.overtimeMultiplier || 1.5);

const workingDaysPerMonth =
  Number(payrollSettings.workingDaysPerMonth || 30);

const dailyWorkingHours =
  Number(payrollSettings.dailyWorkingHours || 8);

    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const [employees, setEmployees] = useState([]);

useEffect(() => {
  fetch("https://fairwork-hfg5sscn.b4a.run/api/employees")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      return response.json();
    })
    .then((data) => {
      setEmployees(data);
    })
    .catch((error) => {
      console.error(
        "Error fetching employees for AI Assistant:",
        error
      );
    });
}, []);

const [messages, setMessages] = useState(() => {
  const savedMessages = localStorage.getItem("aiAssistantMessages");

  if (savedMessages) {
    return JSON.parse(savedMessages);
  }

  return [
    {
      sender: "ai",
      text: "Hello! How can I help you with your workforce management?",
    },
  ];
});

useEffect(() => {
  localStorage.setItem(
    "aiAssistantMessages",
    JSON.stringify(messages)
  );
}, [messages]);

const messagesEndRef = useRef(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);

const [attendanceRecords, setAttendanceRecords] = useState([]);

useEffect(() => {
  fetch("https://fairwork-hfg5sscn.b4a.run/api/attendance")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch attendance");
      }

      return response.json();
    })
    .then((data) => {
      setAttendanceRecords(data);
    })
    .catch((error) => {
      console.error(
        "Error fetching attendance for AI Assistant:",
        error
      );
    });
}, []);

const [payrollRecords, setPayrollRecords] = useState([]);

useEffect(() => {
  fetch("https://fairwork-hfg5sscn.b4a.run/api/payroll")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch payroll");
      }

      return response.json();
    })
    .then((data) => {
      setPayrollRecords(data);
    })
    .catch((error) => {
      console.error(
        "Error fetching payroll for AI Assistant:",
        error
      );
    });
}, []);

const [leaveRequests, setLeaveRequests] = useState([]);

useEffect(() => {
  fetch("https://fairwork-hfg5sscn.b4a.run/api/leaves")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }

      return response.json();
    })
    .then((data) => {
      setLeaveRequests(data);
    })
    .catch((error) => {
      console.error(
        "Error fetching leave requests for AI Assistant:",
        error
      );
    });
}, []);

const [aiSchedules, setAiSchedules] = useState([]);

useEffect(() => {
  fetch("https://fairwork-hfg5sscn.b4a.run/api/ai-schedules")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch AI schedules");
      }

      return response.json();
    })
    .then((data) => {
      setAiSchedules(data);
    })
    .catch((error) => {
      console.error(
        "Error fetching AI schedules for AI Assistant:",
        error
      );
    });
}, []);

const handleSendMessage = (customMessage = null) => {
  const currentMessage = customMessage || message;

if (!currentMessage.trim()) {
    return;
  }

  const userText = currentMessage.trim();

  const newMessage = {
  sender: "user",
  text: userText,
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

  let aiReply = "";

  if (userText.toLowerCase().includes("attendance")) {

    const today = new Date();

const currentDate = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const todayAttendance = attendanceRecords.filter(
  (record) => record.date === currentDate
);

    const presentCount = todayAttendance.filter(
      (record) => record.status === "Present"
    ).length;

    const lateCount = todayAttendance.filter(
      (record) => record.status === "Late"
    ).length;

    const absentCount = todayAttendance.filter(
      (record) => record.status === "Absent"
    ).length;

    aiReply =
      `Attendance Summary: Present ${presentCount}, Late ${lateCount}, Absent ${absentCount}.`;

      } else if (userText.toLowerCase().includes("payroll")) {

  

  

  const today = new Date();

const selectedMonth =
  `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  const totalPayroll = payrollRecords
  .filter((record) => record.month === selectedMonth)
  .reduce(
    (total, record) =>
      total + Number(record.netSalary || 0),
    0
  );

  aiReply =
    `Total payroll is Rs. ${totalPayroll.toLocaleString()}.`;

} else if (userText.toLowerCase().includes("leave")) {

  const pendingCount = leaveRequests.filter(
    (leave) => leave.status === "Pending"
  ).length;

  const approvedCount = leaveRequests.filter(
    (leave) => leave.status === "Approved"
  ).length;

  const rejectedCount = leaveRequests.filter(
    (leave) => leave.status === "Rejected"
  ).length;

  aiReply =
    `Leave Summary: Pending ${pendingCount}, Approved ${approvedCount}, Rejected ${rejectedCount}.`;


    } else if (
  userText.toLowerCase().includes("schedule") ||
  userText.toLowerCase().includes("schedules")
) {

  const uniqueSchedules = new Set(
  aiSchedules.map(
    (schedule) =>
      `${schedule.date}-${schedule.shift}-${schedule.department}`
  )
);

const totalSchedules = uniqueSchedules.size;

  aiReply =
    `There are ${totalSchedules} saved AI schedules in the system.`;


  } else if (
  userText.toLowerCase().includes("employee") ||
  userText.toLowerCase().includes("employees")
) {
  aiReply =
    `There are ${employees.length} employees in the system.`;

  } else {
    aiReply =
      "I can help you with employees, attendance, payroll, leave and schedules.";
  }
  

 setMessages((prevMessages) => [
  ...prevMessages,
  newMessage,
]);

setMessage("");
setIsTyping(true);

setTimeout(() => {
  const aiMessage = {
    sender: "ai",
    text: aiReply,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  setMessages((prevMessages) => [
    ...prevMessages,
    aiMessage,
  ]);

  setIsTyping(false);
}, 800);
};

const handleClearChat = () => {
  const confirmClear = window.confirm(
    "Are you sure you want to clear the chat?"
  );

  if (!confirmClear) return;

  const initialMessage = [
    {
      sender: "ai",
      text: "Hello! How can I help you with your workforce management?",
    },
  ];

  setMessages(initialMessage);

  localStorage.setItem(
    "aiAssistantMessages",
    JSON.stringify(initialMessage)
  );
};

    return (
        <div className="ai-assistant-page">
            <div className="page-header">
                <div>
                    <h1>AI Assistant</h1>
                    <p> 
                        Ask question about employees, attendance,
                        schedules, Leave and payroll
                        </p>
                </div>
                <button
  className="clear-chat-btn"
  onClick={handleClearChat}
>
  Clear Chat
</button>
            </div>

            <div className="ai-chat-container">

  <div className="ai-chat-messages">

    {messages.map((chatMessage, index) => (
      <div
        className={`ai-message ${
          chatMessage.sender === "user"
            ? "user-message"
            : "assistant-message"
        }`}
        key={index}
      >
        <strong>
          {chatMessage.sender === "user"
            ? "You"
            : "AI Assistant"}
        </strong>

        <p>{chatMessage.text}</p>

        <span className="message-time">
  {chatMessage.time}
</span>

      </div>
    ))}

    {isTyping && (
  <div className="ai-message assistant-message typing-message">
    <strong>AI Assistant</strong>
    <p>Typing...</p>
  </div>
)}

    <div ref={messagesEndRef} />

  </div>

  <div className="quick-question-buttons">

  <button
    onClick={() =>
      handleSendMessage("How many employees are there?")
    }
  >
    Employees
  </button>

  <button
    onClick={() =>
      handleSendMessage("What is the attendance?")
    }
  >
    Attendance
  </button>

  <button
    onClick={() =>
      handleSendMessage("What is the payroll?")
    }
  >
    Payroll
  </button>

  <button
    onClick={() =>
      handleSendMessage("What is the leave summary?")
    }
  >
    Leave
  </button>

  <button
    onClick={() =>
      handleSendMessage("How many schedules are saved?")
    }
  >
    Schedules
  </button>

</div>

  <div className="ai-chat-input-area">
    <input
      type="text"
      placeholder="Ask about employees, attendance, payroll..."
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSendMessage();
        }
      }}
    />

    <button onClick={() => handleSendMessage()}>
      Send
    </button>
  </div>

</div>

        </div>
    );
}

export default AIAssistant;