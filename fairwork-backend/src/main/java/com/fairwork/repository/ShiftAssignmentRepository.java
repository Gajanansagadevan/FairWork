package com.fairwork.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fairwork.entity.ShiftAssignment;

public interface ShiftAssignmentRepository
        extends JpaRepository<ShiftAssignment, Long> {

    List<ShiftAssignment> findByShiftId(String shiftId);
    
    ShiftAssignment findByShiftIdAndEmployeeId(
            String shiftId,
            String employeeId
    );
    
    boolean existsByShiftIdAndEmployeeId(
            String shiftId,
            String employeeId
    );
}