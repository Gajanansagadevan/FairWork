package com.fairwork.ai;

public class AIWeeklyScheduleItem {

    private String employeeId;
    private String employeeName;
    private String department;
    private String role;

    private String date;
    private String day;

    private String shiftType;
    private String startTime;
    private String endTime;

    private String reason;

    public AIWeeklyScheduleItem() {
    }

    public AIWeeklyScheduleItem(
            String employeeId,
            String employeeName,
            String department,
            String role,
            String date,
            String day,
            String shiftType,
            String startTime,
            String endTime,
            String reason) {

        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.department = department;
        this.role = role;
        this.date = date;
        this.day = day;
        this.shiftType = shiftType;
        this.startTime = startTime;
        this.endTime = endTime;
        this.reason = reason;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public String getShiftType() {
        return shiftType;
    }

    public void setShiftType(String shiftType) {
        this.shiftType = shiftType;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}