package com.fairwork.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fairwork.entity.LeaveRequest;

public interface LeaveRequestRepository
        extends JpaRepository<LeaveRequest, String> {

    List<LeaveRequest> findByEmployeeIdAndStatusNot(
            String employeeId,
            String status
    );

    List<LeaveRequest> findByEmployeeIdAndStatus(
            String employeeId,
            String status
    );
}