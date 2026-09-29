package com.fairwork.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.fairwork.entity.ShiftAssignment;
import com.fairwork.service.ShiftAssignmentService;

@RestController
@RequestMapping("/api/shift-assignments")
public class ShiftAssignmentController {

    private final ShiftAssignmentService shiftAssignmentService;

    public ShiftAssignmentController(
            ShiftAssignmentService shiftAssignmentService
    ) {
        this.shiftAssignmentService = shiftAssignmentService;
    }

    @GetMapping
    public List<ShiftAssignment> getAllAssignments() {
        return shiftAssignmentService.getAllAssignments();
    }

    @GetMapping("/shift/{shiftId}")
    public List<ShiftAssignment> getAssignmentsByShift(
            @PathVariable String shiftId
    ) {
        return shiftAssignmentService.getAssignmentsByShift(shiftId);
    }

    @PostMapping
    public ShiftAssignment createAssignment(
            @RequestBody ShiftAssignment shiftAssignment
    ) {
        return shiftAssignmentService.saveAssignment(shiftAssignment);
    }

    @DeleteMapping("/{id}")
    public void deleteAssignment(@PathVariable Long id) {
        shiftAssignmentService.deleteAssignment(id);
    }
    
    @DeleteMapping("/shift/{shiftId}/employee/{employeeId}")
    public void deleteAssignmentByShiftAndEmployee(
            @PathVariable String shiftId,
            @PathVariable String employeeId
    ) {
        shiftAssignmentService.deleteAssignmentByShiftAndEmployee(
                shiftId,
                employeeId
        );
    }
}