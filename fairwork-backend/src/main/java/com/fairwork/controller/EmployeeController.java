package com.fairwork.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fairwork.entity.Employee;
import com.fairwork.service.EmployeeService;

@RestController
@RequestMapping("/api/employees")

public class EmployeeController {
	private final EmployeeService employeeService;
	
	 public EmployeeController(EmployeeService employeeService) {
	        this.employeeService = employeeService;
	    }
	
	@GetMapping 
	public List<Employee> getAllEmployee() {
		return employeeService.getAllEmployees();
	}
	
	@PostMapping
	public Employee createEmployee(@RequestBody Employee employee) {
		return employeeService.saveEmployee(employee);
	}
	
	@PutMapping("/{id}")
	public Employee updateEmployee(
			@PathVariable String id,
			@RequestBody Employee employee
			) {
		return employeeService.updateEmployee(id,  employee);
	}
	
	@DeleteMapping("/{id}")
	public void deleteEmployee(@PathVariable String id) {
		employeeService.deleteEmployee(id);
	}
	

}
