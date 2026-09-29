package com.fairwork.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fairwork.entity.ShiftAssignment;
import com.fairwork.repository.ShiftAssignmentRepository;

@Service
public class ShiftAssignmentService {

    private final ShiftAssignmentRepository shiftAssignmentRepository;

    public ShiftAssignmentService(
            ShiftAssignmentRepository shiftAssignmentRepository
    ) {
        this.shiftAssignmentRepository = shiftAssignmentRepository;
    }

    public List<ShiftAssignment> getAllAssignments() {
        return shiftAssignmentRepository.findAll();
    }

    public List<ShiftAssignment> getAssignmentsByShift(String shiftId) {
        return shiftAssignmentRepository.findByShiftId(shiftId);
    }

    public ShiftAssignment saveAssignment(
            ShiftAssignment shiftAssignment
    ) {
        boolean alreadyAssigned =
                shiftAssignmentRepository
                        .existsByShiftIdAndEmployeeId(
                                shiftAssignment.getShiftId(),
                                shiftAssignment.getEmployeeId()
                        );

        if (alreadyAssigned) {
            throw new RuntimeException(
                    "Employee is already assigned to this shift"
            );
        }

        return shiftAssignmentRepository.save(shiftAssignment);
    }

    public void deleteAssignment(Long id) {
        shiftAssignmentRepository.deleteById(id);
    }
    
    public void deleteAssignmentByShiftAndEmployee(
            String shiftId,
            String employeeId
    ) {
        ShiftAssignment assignment =
                shiftAssignmentRepository
                        .findByShiftIdAndEmployeeId(
                                shiftId,
                                employeeId
                        );

        if (assignment != null) {
            shiftAssignmentRepository.delete(assignment);
        }
    }
}