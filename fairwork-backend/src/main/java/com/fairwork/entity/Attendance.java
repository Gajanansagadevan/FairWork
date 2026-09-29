package com.fairwork.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "attendance")

public class Attendance {
	
	@Id
	private String id;
	
	private String employeeId;
	private String date;
	
	private String name;
	private String department;
	private String checkIn;
	private String checkOut;
	private String workingHours;
	private String overtime;
	private String status;
	
	public Attendance() {
	}
	
	public Attendance(
			String id,
			String employeeId,
	        String date,
			String name,
			String department,
			String checkIn,
			String checkOut,
			String workingHours,
			String overtime,
			String status
			) {
		this.id = id;
		this.employeeId = employeeId;
		this.date = date;
		this.name = name;
		this.department = department;
		this.checkIn = checkIn;
		this.checkOut = checkOut;
		this.workingHours = workingHours;
		this.overtime = overtime;
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

	public String getDate() {
	    return date;
	}

	public void setDate(String date) {
	    this.date = date;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getDepartment() {
		return department;
	}
	
	public void setDepartment(String department) {
		this.department = department;
	}
	
	public String getCheckIn() {
		return checkIn;
	}
	
	public void setCheckIn(String checkIn) {
		this.checkIn = checkIn;
	}
	
	public String getCheckOut() {
		return checkOut;
	}
	
	public void setCheckOut(String checkOut) {
		this.checkOut = checkOut;
	}
	
	public String getWorkingHours() {
		return workingHours;
	}
	
	public void setWorkingHours(String workingHours) {
		this.workingHours = workingHours;
	}
	
	public String getOvertime() {
	    return overtime;
	}

	public void setOvertime(String overtime) {
	    this.overtime = overtime;
	}
	
	public String getStatus() {
		return status;
	}
	 
	public void setStatus(String status) {
		this.status = status;
	}
	
}
