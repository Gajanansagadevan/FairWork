package com.fairwork.dto;

public class AIReplacementRecommendation {

    private Long scheduleId;

    private String absentEmployeeId;
    private String absentEmployeeName;

    private String replacementEmployeeId;
    private String replacementEmployeeName;

    private String department;
    private String date;
    private String shift;

    private String reason;

    public AIReplacementRecommendation() {
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getAbsentEmployeeId() {
        return absentEmployeeId;
    }

    public void setAbsentEmployeeId(String absentEmployeeId) {
        this.absentEmployeeId = absentEmployeeId;
    }

    public String getAbsentEmployeeName() {
        return absentEmployeeName;
    }

    public void setAbsentEmployeeName(String absentEmployeeName) {
        this.absentEmployeeName = absentEmployeeName;
    }

    public String getReplacementEmployeeId() {
        return replacementEmployeeId;
    }

    public void setReplacementEmployeeId(String replacementEmployeeId) {
        this.replacementEmployeeId = replacementEmployeeId;
    }

    public String getReplacementEmployeeName() {
        return replacementEmployeeName;
    }

    public void setReplacementEmployeeName(String replacementEmployeeName) {
        this.replacementEmployeeName = replacementEmployeeName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}