package com.fairwork.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fairwork.entity.Payroll;

public interface PayrollRepository
        extends JpaRepository<Payroll, String> {
	
	boolean existsByEmployeeIdAndMonth(
	        String employeeId,
	        String month
	);
}