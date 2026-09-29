package com.fairwork.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "payroll")
public class Payroll {
	
	@Id
	private String id;
	
	private String employeeId;
	private String name;
	private String department;
	private String month;
	
	private double basicSalary;
	private double workingHours;
	private int scheduledShiftDays;
	private double overtimeHours;
	private double allowances;
	private double deductions;
	private double netSalary;
	
	private String status;
	
	public Payroll() {
	}
	
	public Payroll(
			String id,
			String employeeId,
			String name,
			String department,
			String month,
			double basicSalary,
			double overtimeHours,
			double allowances,
			double deductions,
			double netSalary,
			String status
			) {
		this.id = id;
		this.employeeId = employeeId;
		this.name = name;
		this.department = department;
		this.month = month;
		this.basicSalary = basicSalary;
		this.overtimeHours = overtimeHours;
		this.allowances = allowances;
		this.deductions = deductions;
		this.netSalary = netSalary;
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
	
	public String getMonth() {
		return month;
	}
	
	public void setMonth(String month) {
		this.month = month;
	}
	
	public double getBasicSalary() {
		return basicSalary;
	}
	
	public void setBasicSalary(double basicSalary) {
		this.basicSalary = basicSalary;
	}
	
	public double getWorkingHours() {
	    return workingHours;
	}

	public void setWorkingHours(double workingHours) {
	    this.workingHours = workingHours;
	}
	
	public int getScheduledShiftDays() {
	    return scheduledShiftDays;
	}

	public void setScheduledShiftDays(int scheduledShiftDays) {
	    this.scheduledShiftDays = scheduledShiftDays;
	}
	
	public double getOvertimeHours() {
		return overtimeHours;
	}
	
	public void setOvertimeHours(double overtimeHours) {
		this.overtimeHours = overtimeHours;
	}
	
	public double getAllowances() {
		return allowances;
	}
	
	public void setAllowances(double allowances) {
		this.allowances = allowances;
	}
	
	public double getDeductions() {
		return deductions;
	}
	
	public void setDeductions(double deductions) {
		this.deductions = deductions;
	}
	
	public double getNetSalary() {
		return netSalary;
	}
	
	public void setNetSalary(double netSalary) {
		this.netSalary = netSalary;
	}
	
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}

}
