package com.fairwork.ai;

public class AIEmployeeScheduleRequest {

    private String employeeId;
    private String date;

    public AIEmployeeScheduleRequest() {
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}