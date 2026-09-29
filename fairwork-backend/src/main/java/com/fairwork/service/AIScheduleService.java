package com.fairwork.service;

import com.fairwork.ai.AIWeeklyConfirmRequest;
import com.fairwork.ai.AIWeeklyScheduleItem;
import java.util.ArrayList;
import com.fairwork.entity.AISchedule;

import com.fairwork.exception.ConflictException;

import com.fairwork.repository.AIScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;



@Service
public class AIScheduleService {

    private final AIScheduleRepository aiScheduleRepository;

    public AIScheduleService(
            AIScheduleRepository aiScheduleRepository
    ) {
        this.aiScheduleRepository = aiScheduleRepository;
    }

    public List<AISchedule> getAllSchedules() {
        return aiScheduleRepository.findAll();
    }

    public AISchedule saveSchedule(AISchedule aiSchedule) {

        boolean alreadyExists =
                aiScheduleRepository
                        .existsByDateAndShiftAndDepartmentAndEmployeeId(
                                aiSchedule.getDate(),
                                aiSchedule.getShift(),
                                aiSchedule.getDepartment(),
                                aiSchedule.getEmployeeId()
                        );

        if (alreadyExists) {
            throw new ConflictException(
                    "Employee is already assigned to this AI schedule"
            );
        }

        return aiScheduleRepository.save(aiSchedule);
    }
    
    @Transactional
    public List<AISchedule> saveWeeklySchedule(
            AIWeeklyConfirmRequest request) {
    

        if (request.getDepartment() == null ||
            request.getDepartment().isBlank()) {
            throw new RuntimeException("Department is required");
        }

        if (request.getSchedule() == null ||
            request.getSchedule().isEmpty()) {
            throw new RuntimeException(
                    "Weekly schedule is empty"
            );
        }

        List<AISchedule> savedSchedules =
                new ArrayList<>();

        for (AIWeeklyScheduleItem item :
                request.getSchedule()) {

            // OFF and LEAVE are preview-only.
            // Do not save them as working schedules.
        	if ("LEAVE".equalsIgnoreCase(item.getShiftType())) {
        	    continue;
        	}

            // Safety: only selected department
            if (item.getDepartment() == null ||
                !item.getDepartment().equalsIgnoreCase(
                        request.getDepartment())) {

                throw new RuntimeException(
                        "Schedule contains employee from another department"
                );
            }

            // Employee must not have another
            // AI work schedule on the same date.
            boolean employeeAlreadyScheduled =
                    aiScheduleRepository
                            .existsByDateAndEmployeeId(
                                    item.getDate(),
                                    item.getEmployeeId()
                            );

            if (employeeAlreadyScheduled) {
                throw new ConflictException(
                        item.getEmployeeName() +
                        " already has a schedule on " +
                        item.getDate()
                );
            }

            AISchedule aiSchedule =
                    new AISchedule(
                            item.getDate(),
                            item.getShiftType(),
                            item.getDepartment(),
                            item.getEmployeeId(),
                            item.getEmployeeName()
                    );

            savedSchedules.add(
                    aiScheduleRepository.save(aiSchedule)
            );
        }

        return savedSchedules;
    }

    public void deleteSchedule(Long id) {
        aiScheduleRepository.deleteById(id);
    }
}
