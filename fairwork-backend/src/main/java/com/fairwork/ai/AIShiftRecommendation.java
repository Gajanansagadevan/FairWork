package com.fairwork.ai;

import java.util.List;

public class AIShiftRecommendation {

    private String employeeId;
    private String employeeName;
    private String department;
    private String role;

    private String shiftId;
    private String shiftName;
    private String startTime;
    private String endTime;

    private String date;

    private double score;
    private List<String> reasons;

    public AIShiftRecommendation(
            String employeeId,
            String employeeName,
            String department,
            String role,
            String shiftId,
            String shiftName,
            String startTime,
            String endTime,
            String date,
            double score,
            List<String> reasons) {

        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.department = department;
        this.role = role;
        this.shiftId = shiftId;
        this.shiftName = shiftName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.date = date;
        this.score = score;
        this.reasons = reasons;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public String getDepartment() {
        return department;
    }

    public String getRole() {
        return role;
    }

    public String getShiftId() {
        return shiftId;
    }

    public String getShiftName() {
        return shiftName;
    }

    public String getStartTime() {
        return startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public String getDate() {
        return date;
    }

    public double getScore() {
        return score;
    }

    public List<String> getReasons() {
        return reasons;
    }
}