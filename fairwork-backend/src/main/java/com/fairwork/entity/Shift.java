package com.fairwork.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "shifts")
public class Shift {
	
	@Id
	private String id;
	
	private String name;
	private String startTime;
	private String endTime;
	private String department;
	private int requiredEmployees;
	private String status;
	
	public Shift() {
	}
	
	public Shift(
			String id,
			String name,
			String startTime,
			String endTime,
			String department,
			int requiredEmployees,
			String status
			) {
		this.id = id;
		this.name = name;
		this.startTime = startTime;
		this.endTime = endTime;
		this.department = department;
		this.requiredEmployees = requiredEmployees;
		this.status = status;
	}
	
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id =  id;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
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
	
	public String getDepartment() {
		return department;
	}
	
	public void setDepartment(String department) {
		this.department = department;
	}
	
	public int getRequiredEmployees() {
		return requiredEmployees;
	}
	
	public void setRequiredEmployees(int requiredEmployees) {
		this.requiredEmployees = requiredEmployees;
	}
	
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}

}
