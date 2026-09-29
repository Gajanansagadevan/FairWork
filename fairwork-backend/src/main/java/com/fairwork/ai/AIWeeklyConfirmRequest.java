package com.fairwork.ai;

import java.util.List;

public class AIWeeklyConfirmRequest {

    private String department;
    private String weekStartDate;
    private List<AIWeeklyScheduleItem> schedule;

    public AIWeeklyConfirmRequest() {
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

    public List<AIWeeklyScheduleItem> getSchedule() {
        return schedule;
    }

    public void setSchedule(
            List<AIWeeklyScheduleItem> schedule) {
        this.schedule = schedule;
    }
}