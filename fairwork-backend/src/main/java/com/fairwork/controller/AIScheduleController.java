package com.fairwork.controller;

import com.fairwork.entity.AISchedule;

import com.fairwork.service.AIScheduleService;
import org.springframework.web.bind.annotation.*;
import com.fairwork.ai.AIWeeklyConfirmRequest;

import java.util.List;

@RestController
@RequestMapping("/api/ai-schedules")
public class AIScheduleController {

    private final AIScheduleService aiScheduleService;

    public AIScheduleController(
            AIScheduleService aiScheduleService
    ) {
        this.aiScheduleService = aiScheduleService;
    }

    @GetMapping
    public List<AISchedule> getAllSchedules() {
        return aiScheduleService.getAllSchedules();
    }

    @PostMapping
    public AISchedule createSchedule(
            @RequestBody AISchedule aiSchedule
    ) {
        return aiScheduleService.saveSchedule(aiSchedule);
    }
    
    @PostMapping("/confirm-weekly")
    public List<AISchedule> confirmWeeklySchedule(
            @RequestBody AIWeeklyConfirmRequest request
    ) {
        return aiScheduleService.saveWeeklySchedule(request);
    }

    @DeleteMapping("/{id}")
    public void deleteSchedule(@PathVariable Long id) {
        aiScheduleService.deleteSchedule(id);
    }
}