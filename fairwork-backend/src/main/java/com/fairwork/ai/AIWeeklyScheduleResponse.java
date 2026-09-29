package com.fairwork.ai;

import java.util.List;

public class AIWeeklyScheduleResponse {

    private String department;
    private String weekStartDate;
    private String weekEndDate;
    private int totalEmployees;
    private List<AIWeeklyScheduleItem> schedule;
    private List<String> notes;

    public AIWeeklyScheduleResponse() {
    }

    public AIWeeklyScheduleResponse(
            String department,
            String weekStartDate,
            String weekEndDate,
            int totalEmployees,
            List<AIWeeklyScheduleItem> schedule,
            List<String> notes) {

        this.department = department;
        this.weekStartDate = weekStartDate;
        this.weekEndDate = weekEndDate;
        this.totalEmployees = totalEmployees;
        this.schedule = schedule;
        this.notes = notes;
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

    public String getWeekEndDate() {
        return weekEndDate;
    }

    public void setWeekEndDate(String weekEndDate) {
        this.weekEndDate = weekEndDate;
    }

    public int getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(int totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public List<AIWeeklyScheduleItem> getSchedule() {
        return schedule;
    }

    public void setSchedule(
            List<AIWeeklyScheduleItem> schedule) {
        this.schedule = schedule;
    }

    public List<String> getNotes() {
        return notes;
    }

    public void setNotes(List<String> notes) {
        this.notes = notes;
    }
}