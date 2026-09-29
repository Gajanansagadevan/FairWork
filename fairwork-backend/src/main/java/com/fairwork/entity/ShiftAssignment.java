package com.fairwork.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "shift-assignments")
public class ShiftAssignment {
	
	@Id 
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String shiftId;
	private String employeeId;
	private String employeeName;
	private String department;
	
	public ShiftAssignment() {
	}
	
	public ShiftAssignment(
			String shiftId,
			String employeeId,
			String employeeName,
			String department
			) {
		this.shiftId = shiftId;
		this.employeeId = employeeId;
		this.employeeName = employeeName;
		this.department = department;
	}
	
	public Long getId() {
		return id;
	}
	
	public void setId(long id) {
		this.id = id;
	}
	
	public String getShiftId() {
		return shiftId;
	}
	
	public void setShiftId(String shiftId) {
		this.shiftId = shiftId;
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

}
