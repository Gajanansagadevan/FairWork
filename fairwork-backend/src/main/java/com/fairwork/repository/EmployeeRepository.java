package com.fairwork.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fairwork.entity.Employee;

public interface EmployeeRepository
        extends JpaRepository<Employee, String> {
}