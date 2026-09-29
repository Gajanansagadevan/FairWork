package com.fairwork.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {
	
	@Id
	private String id;
	
	private String employeeId;
	private String employeeName;
	private String department;
	private String leaveType;
	private String startDate;
	private String endDate;
	private int days;
	private String reason;
	private String status;
	
	public LeaveRequest() {
	}
	
	public LeaveRequest(
		String id,
		String employeeId,
		String employeeName,
		String department,
		String leaveType,
		String startDate,
		String endDate,
		int days,
		String reason,
		String status
		) {
		this.id = id;
		this.employeeId = employeeId;
		this.employeeName = employeeName;
		this.department = department;
		this.leaveType = leaveType;
		this.startDate = startDate;
		this.endDate = endDate;
		this.days = days;
		this.reason = reason;
		this.status = status;
	}
	
	public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public int getDays() {
        return days;
    }

    public void setDays(int days) {
        this.days = days;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
	

}
