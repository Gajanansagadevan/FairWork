package com.fairwork.ai;

public class AIWeeklyScheduleRequest {

    private String department;
    private String weekStartDate;

    public AIWeeklyScheduleRequest() {
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getWeekStartDate() {
        return weekStartDate;
    }

    public void setWeekStartDate(String weekStartDate) {
        this.weekStartDate = weekStartDate;
    }
}