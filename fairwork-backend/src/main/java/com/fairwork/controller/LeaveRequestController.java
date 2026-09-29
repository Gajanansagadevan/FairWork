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

import com.fairwork.entity.LeaveRequest;
import com.fairwork.service.LeaveRequestService;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(
            LeaveRequestService leaveRequestService
    ) {
        this.leaveRequestService = leaveRequestService;
    }

    @GetMapping
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestService.getAllLeaveRequests();
    }

    @PostMapping
    public LeaveRequest createLeaveRequest(
            @RequestBody LeaveRequest leaveRequest
    ) {
        return leaveRequestService.saveLeaveRequest(leaveRequest);
    }

    @PutMapping("/{id}")
    public LeaveRequest updateLeaveRequest(
            @PathVariable String id,
            @RequestBody LeaveRequest leaveRequest
    ) {
        return leaveRequestService.updateLeaveRequest(
                id,
                leaveRequest
        );
    }

    @DeleteMapping("/{id}")
    public void deleteLeaveRequest(
            @PathVariable String id
    ) {
        leaveRequestService.deleteLeaveRequest(id);
    }
}