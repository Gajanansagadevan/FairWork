package com.fairwork.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fairwork.entity.LeaveRequest;
import com.fairwork.exception.BadRequestException;
import com.fairwork.exception.ConflictException;
import com.fairwork.repository.LeaveRequestRepository;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;

    public LeaveRequestService(
            LeaveRequestRepository leaveRequestRepository
    ) {
        this.leaveRequestRepository = leaveRequestRepository;
    }

    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }

    public LeaveRequest saveLeaveRequest(
            LeaveRequest leaveRequest
    ) {

        LocalDate newStart =
                LocalDate.parse(leaveRequest.getStartDate());

        LocalDate newEnd =
                LocalDate.parse(leaveRequest.getEndDate());

        LocalDate today = LocalDate.now();

        if (newStart.isBefore(today)) {
            throw new BadRequestException(
                    "Leave cannot be requested for a past date"
            );
        }

        if (newEnd.isBefore(newStart)) {
            throw new BadRequestException(
                    "End date cannot be before start date"
            );
        }

        int calculatedDays =
                (int) ChronoUnit.DAYS.between(
                        newStart,
                        newEnd
                ) + 1;

        leaveRequest.setDays(calculatedDays);

        int leaveLimit;

        switch (leaveRequest.getLeaveType()) {
            case "Annual Leave":
                leaveLimit = 7;
                break;

            case "Casual Leave":
                leaveLimit = 5;
                break;

            case "Sick Leave":
                leaveLimit = 3;
                break;

            default:
                throw new BadRequestException(
                        "Invalid leave type"
                );
        }

        List<LeaveRequest> existingLeaves =
                leaveRequestRepository.findByEmployeeIdAndStatusNot(
                        leaveRequest.getEmployeeId(),
                        "Rejected"
                );

        int selectedYear = newStart.getYear();
        int selectedMonth = newStart.getMonthValue();

        int usedLeaveDays = existingLeaves.stream()

                .filter(existingLeave ->
                        existingLeave.getLeaveType()
                                .equals(leaveRequest.getLeaveType())
                )

                .filter(existingLeave -> {

                    LocalDate existingStart =
                            LocalDate.parse(
                                    existingLeave.getStartDate()
                            );

                    // Annual Leave = 7 days per month
                    if ("Annual Leave".equals(
                            leaveRequest.getLeaveType())) {

                        return existingStart.getYear() == selectedYear
                                &&
                               existingStart.getMonthValue() == selectedMonth;
                    }

                    // Casual + Sick = yearly limits
                    return existingStart.getYear() == selectedYear;
                })

                .mapToInt(LeaveRequest::getDays)
                .sum();

        if (usedLeaveDays + calculatedDays > leaveLimit) {

            String period =
                    "Annual Leave".equals(
                            leaveRequest.getLeaveType()
                    )
                            ? "per month"
                            : "per year";

            throw new BadRequestException(
                    "Leave limit exceeded. Maximum "
                            + leaveLimit
                            + " days "
                            + period
                            + " allowed for "
                            + leaveRequest.getLeaveType()
            );
        }

        boolean hasOverlap = existingLeaves.stream()
                .anyMatch(existingLeave -> {

                    LocalDate existingStart =
                            LocalDate.parse(
                                    existingLeave.getStartDate()
                            );

                    LocalDate existingEnd =
                            LocalDate.parse(
                                    existingLeave.getEndDate()
                            );

                    return !newStart.isAfter(existingEnd)
                            && !newEnd.isBefore(existingStart);
                });

        if (hasOverlap) {
            throw new ConflictException(
                    "Employee already has a leave request for the selected dates"
            );
        }

        leaveRequest.setId(UUID.randomUUID().toString());

        return leaveRequestRepository.save(leaveRequest);
    }

    public LeaveRequest updateLeaveRequest(
            String id,
            LeaveRequest leaveRequest
    ) {
        leaveRequest.setId(id);
        return leaveRequestRepository.save(leaveRequest);
    }

    public void deleteLeaveRequest(String id) {
        leaveRequestRepository.deleteById(id);
    }
}