package com.fairwork.controller;

import java.util.List;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.fairwork.ai.AIRecommendation;
import com.fairwork.ai.AIRecommendationRequest;
import com.fairwork.ai.AIEmployeeScheduleRequest;
import com.fairwork.ai.AIShiftRecommendation;
import com.fairwork.ai.AIWeeklyScheduleRequest;
import com.fairwork.ai.AIWeeklyScheduleResponse;
import com.fairwork.ai.WorkforceAIService;
import com.fairwork.dto.AIReplacementRecommendation;
import com.fairwork.entity.AISchedule;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkforceAIController {

    private final WorkforceAIService workforceAIService;

    public WorkforceAIController(
            WorkforceAIService workforceAIService) {

        this.workforceAIService = workforceAIService;
    }

    @PostMapping("/recommend-shift")
    public ResponseEntity<List<AIRecommendation>>
            recommendShift(
                    @RequestBody AIRecommendationRequest request) {

        List<AIRecommendation> recommendations =
                workforceAIService
                        .recommendEmployees(request);

        return ResponseEntity.ok(recommendations);
    }
   
    @PostMapping("/recommend-employee-shift")
    public ResponseEntity<AIShiftRecommendation>
            recommendEmployeeShift(
                    @RequestBody AIEmployeeScheduleRequest request) {

        AIShiftRecommendation recommendation =
                workforceAIService
                        .recommendBestShift(request);

        return ResponseEntity.ok(recommendation);
    }
    
    @PostMapping("/generate-weekly-schedule")
    public ResponseEntity<AIWeeklyScheduleResponse>
            generateWeeklySchedule(
                    @RequestBody AIWeeklyScheduleRequest request) {

        AIWeeklyScheduleResponse response =
                workforceAIService
                        .generateWeeklySchedule(request);

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/recommend-replacement")
    public AIReplacementRecommendation recommendReplacement(
            @RequestParam Long scheduleId) {

        return workforceAIService
                .recommendReplacement(scheduleId);
    }
    
    @PostMapping("/confirm-replacement")
    public AISchedule confirmReplacement(
            @RequestParam Long scheduleId,
            @RequestParam String replacementEmployeeId) {

        return workforceAIService.confirmReplacement(
                scheduleId,
                replacementEmployeeId
        );
    }
    
}