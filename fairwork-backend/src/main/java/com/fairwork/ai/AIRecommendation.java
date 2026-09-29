package com.fairwork.ai;

import java.util.List;

public class AIRecommendation {

    private String employeeId;
    private String employeeName;
    private String department;
    private String role;

    private double score;

    private List<String> reasons;

    public AIRecommendation() {
    }

    public AIRecommendation(
            String employeeId,
            String employeeName,
            String department,
            String role,
            double score,
            List<String> reasons) {

        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.department = department;
        this.role = role;
        this.score = score;
        this.reasons = reasons;
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

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }
}