package com.fairwork.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fairwork.entity.Employee;
import com.fairwork.repository.EmployeeRepository;

@Service

public class EmployeeService {
	private final EmployeeRepository employeeRepository;
	
	public EmployeeService(EmployeeRepository employeeRepository) {
		this.employeeRepository = employeeRepository;
	}
	
	public List<Employee> getAllEmployees() {
		return employeeRepository.findAll();
	}
	
	public Employee saveEmployee(Employee employee) {
		return employeeRepository.save(employee);
	}
	
	public Employee updateEmployee(String id, Employee employee) {
		employee.setId(id);
		return employeeRepository.save(employee);
	}
	
	public void deleteEmployee(String id) {
		employeeRepository.deleteById(id);
	}
	
}
