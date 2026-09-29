package com.fairwork.ai;

import java.util.ArrayList;

import java.util.Comparator;
import java.util.List;
import java.time.LocalDate;
import java.time.DayOfWeek;

import org.springframework.stereotype.Service;

import com.fairwork.entity.Attendance;
import com.fairwork.entity.Employee;
import com.fairwork.dto.AIReplacementRecommendation;
import com.fairwork.entity.AISchedule;
import com.fairwork.entity.LeaveRequest;
import com.fairwork.entity.Shift;
import com.fairwork.repository.AttendanceRepository;
import com.fairwork.repository.EmployeeRepository;
import com.fairwork.repository.LeaveRequestRepository;
import com.fairwork.repository.ShiftAssignmentRepository;
import com.fairwork.repository.ShiftRepository;
import com.fairwork.repository.AIScheduleRepository;

@Service
public class WorkforceAIService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ShiftRepository shiftRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final AIScheduleRepository aiScheduleRepository;

    public WorkforceAIService(
            EmployeeRepository employeeRepository,
            AttendanceRepository attendanceRepository,
            LeaveRequestRepository leaveRequestRepository,
            ShiftRepository shiftRepository,
            ShiftAssignmentRepository shiftAssignmentRepository,
            AIScheduleRepository aiScheduleRepository) {

        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.shiftRepository = shiftRepository;
        this.shiftAssignmentRepository = shiftAssignmentRepository;
        this.aiScheduleRepository = aiScheduleRepository;
    }

    public List<AIRecommendation> recommendEmployees(
            AIRecommendationRequest request) {

        Shift shift = shiftRepository
                .findById(request.getShiftId())
                .orElseThrow(() ->
                        new RuntimeException("Shift not found"));

        List<Employee> employees =
                employeeRepository.findAll();

        List<AIRecommendation> recommendations =
                new ArrayList<>();

        var existingAssignments =
                shiftAssignmentRepository
                        .findByShiftId(shift.getId());

        int currentlyAssigned =
                existingAssignments.size();

        int assignedSupervisors = 0;
        int assignedCSA = 0;

        for (var assignment : existingAssignments) {

            Employee assignedEmployee =
                    employeeRepository
                            .findById(assignment.getEmployeeId())
                            .orElse(null);

            if (assignedEmployee == null) {
                continue;
            }

            if ("Supervisor".equalsIgnoreCase(
                    assignedEmployee.getRole())) {

                assignedSupervisors++;

            } else if ("CSA".equalsIgnoreCase(
                    assignedEmployee.getRole())) {

                assignedCSA++;
            }
        }
        
        int supervisorTarget =
                "Dry".equalsIgnoreCase(shift.getDepartment())
                        ? 2
                        : 1;

        int csaTarget =
                "Dry".equalsIgnoreCase(shift.getDepartment())
                        ? 4
                        : 2;
        
        supervisorTarget =
                Math.max(
                        0,
                        supervisorTarget - assignedSupervisors
                );

        csaTarget =
                Math.max(
                        0,
                        csaTarget - assignedCSA
                );

        int shortage =
                shift.getRequiredEmployees() - currentlyAssigned;

        if (shortage <= 0) {
            return recommendations;
        }

        for (Employee employee : employees) {

            /*
             * Manager and Executive are not department staff,
             * so they are not used for normal department
             * shift recommendations.
             */
            if ("Manager".equalsIgnoreCase(employee.getRole()) ||
                "Executive".equalsIgnoreCase(employee.getRole())) {
                continue;
            }

            /*
             * Employee must belong to the same department.
             */
            if (employee.getDepartment() == null ||
                !employee.getDepartment()
                        .equalsIgnoreCase(shift.getDepartment())) {
                continue;
            }

            /*
             * Employee must be active.
             */
            if (employee.getStatus() != null &&
                !employee.getStatus().equalsIgnoreCase("Active")) {
                continue;
            }

            /*
             * Do not recommend someone already assigned
             * to this shift.
             */
            boolean alreadyAssigned =
                    shiftAssignmentRepository
                            .existsByShiftIdAndEmployeeId(
                                    shift.getId(),
                                    employee.getId()
                            );

            if (alreadyAssigned) {
                continue;
            }

            /*
             * Approved leave on selected date
             * disqualifies employee.
             */
            if (isOnApprovedLeave(
                    employee.getId(),
                    request.getDate())) {
                continue;
            }
           
            
            boolean alreadyScheduledOnDate =
                    aiScheduleRepository.existsByDateAndEmployeeId(
                            request.getDate(),
                            employee.getId()
                    );

            if (alreadyScheduledOnDate) {
                continue;
            }

            double score = 0;

            List<String> reasons =
                    new ArrayList<>();


            // Department match
            score += 30;
            reasons.add("Matches required department");


            // Active employee
            score += 15;
            reasons.add("Employee is active");


            // Attendance analysis
            List<Attendance> attendanceHistory =
                    attendanceRepository
                            .findByEmployeeId(employee.getId());

            if (attendanceHistory.isEmpty()) {

                score += 10;

                reasons.add(
                        "No negative attendance history"
                );

            } else {

                long presentCount =
                        attendanceHistory.stream()
                                .filter(a ->
                                        "Present".equalsIgnoreCase(
                                                a.getStatus()))
                                .count();

                long lateCount =
                        attendanceHistory.stream()
                                .filter(a ->
                                        "Late".equalsIgnoreCase(
                                                a.getStatus()))
                                .count();

                long absentCount =
                        attendanceHistory.stream()
                                .filter(a ->
                                        "Absent".equalsIgnoreCase(
                                                a.getStatus()))
                                .count();


                double attendanceRate =
                        (double) presentCount /
                        attendanceHistory.size();


                if (attendanceRate >= 0.90) {

                    score += 25;

                    reasons.add(
                            "Excellent attendance record"
                    );

                } else if (attendanceRate >= 0.75) {

                    score += 20;

                    reasons.add(
                            "Good attendance record"
                    );

                } else if (attendanceRate >= 0.50) {

                    score += 10;

                    reasons.add(
                            "Average attendance record"
                    );

                } else {

                    reasons.add(
                            "Low attendance reliability"
                    );
                }


                if (lateCount == 0) {

                    score += 10;

                    reasons.add(
                            "No late attendance records"
                    );

                } else if (lateCount <= 2) {

                    score += 5;

                    reasons.add(
                            "Low late attendance count"
                    );

                } else {

                    score -= 5;

                    reasons.add(
                            "Frequent late attendance"
                    );
                }


                if (absentCount > 2) {

                    score -= 10;

                    reasons.add(
                            "Multiple absence records"
                    );
                }
                
                double totalOvertimeHours = 0;

                for (Attendance attendance : attendanceHistory) {
                    totalOvertimeHours +=
                            parseOvertimeHours(
                                    attendance.getOvertime()
                            );
                }

                if (totalOvertimeHours <= 5) {

                    score += 15;

                    reasons.add(
                            "Low overtime workload"
                    );

                } else if (totalOvertimeHours <= 15) {

                    score += 10;

                    reasons.add(
                            "Moderate overtime workload"
                    );

                } else if (totalOvertimeHours <= 25) {

                    score += 5;

                    reasons.add(
                            "Higher overtime workload"
                    );

                } else {

                    score -= 10;

                    reasons.add(
                            "High overtime workload risk"
                    );
                }
            }


            /*
             * Role-based scoring
             */
            if ("Supervisor".equalsIgnoreCase(
                    employee.getRole())) {

                score += 10;

                reasons.add(
                        "Supervisor role supports shift coverage"
                );

            } else if ("SSA".equalsIgnoreCase(
                    employee.getRole())) {

                score += 7;

                reasons.add(
                        "Senior staff member"
                );

            } else if ("CSA".equalsIgnoreCase(
                    employee.getRole())) {

                score += 6;

                reasons.add(
                        "CSA available for supervisor support"
                );

            } else {

                score += 5;

                reasons.add(
                        "Available department employee"
                );
            }

            recommendations.add(
                    new AIRecommendation(
                            employee.getId(),
                            employee.getName(),
                            employee.getDepartment(),
                            employee.getRole(),
                            score,
                            reasons
                    )
            );
        }


        /*
         * Highest AI score first
         */
        recommendations.sort(
                Comparator.comparingDouble(
                        AIRecommendation::getScore
                ).reversed()
        );


        /*
         * ROLE-AWARE STAFFING SELECTION
         *
         * Dry:
         *   Target = 2 Supervisors + 4 CSA
         *
         * Other departments:
         *   Target = 1 Supervisor + 2 CSA
         *
         * The final result will never exceed
         * the actual shift shortage.
         */
        List<AIRecommendation> finalRecommendations =
                new ArrayList<>();


        /*
         * 1. Select Supervisors first
         */
        for (AIRecommendation recommendation : recommendations) {

            if (finalRecommendations.size() >= shortage) {
                break;
            }

            if (supervisorTarget <= 0) {
                break;
            }

            if ("Supervisor".equalsIgnoreCase(
                    recommendation.getRole())) {

                recommendation.getReasons().add(
                        "Selected to satisfy supervisor coverage"
                );

                finalRecommendations.add(recommendation);

                supervisorTarget--;
            }
        }


        /*
         * 2. Select CSA staff
         */
        for (AIRecommendation recommendation : recommendations) {

            if (finalRecommendations.size() >= shortage) {
                break;
            }

            if (csaTarget <= 0) {
                break;
            }

            if ("CSA".equalsIgnoreCase(
                    recommendation.getRole()) &&
                !finalRecommendations.contains(recommendation)) {

                recommendation.getReasons().add(
                        "Selected to support supervisor coverage"
                );

                finalRecommendations.add(recommendation);

                csaTarget--;
            }
        }


        /*
         * 3. Fill remaining shortage using
         * highest-scoring eligible employees.
         */
        for (AIRecommendation recommendation : recommendations) {

            if (finalRecommendations.size() >= shortage) {
                break;
            }

            if (!finalRecommendations.contains(recommendation)) {

                finalRecommendations.add(recommendation);
            }
        }

        return finalRecommendations;
    }

    public AIShiftRecommendation recommendBestShift(
            AIEmployeeScheduleRequest request) {

        // 1. Validate request
        if (request.getEmployeeId() == null ||
            request.getEmployeeId().isBlank()) {
            throw new RuntimeException("Employee ID is required");
        }

        if (request.getDate() == null ||
            request.getDate().isBlank()) {
            throw new RuntimeException("Date is required");
        }

        // 2. Find employee
        Employee employee = employeeRepository
                .findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        // 3. Employee must be active
        if (employee.getStatus() != null &&
            !employee.getStatus().equalsIgnoreCase("Active")) {
            throw new RuntimeException(
                    "Employee is not active"
            );
        }

        // 4. Manager / Executive do not use department shifts
        if ("Manager".equalsIgnoreCase(employee.getRole()) ||
            "Executive".equalsIgnoreCase(employee.getRole())) {

            throw new RuntimeException(
                    "Manager and Executive do not use department shift scheduling"
            );
        }

        if (employee.getDepartment() == null ||
            employee.getDepartment().isBlank()) {

            throw new RuntimeException(
                    "Employee does not have a department"
            );
        }

        // 5. Check approved leave
        if (isOnApprovedLeave(
                employee.getId(),
                request.getDate())) {

            throw new RuntimeException(
                    "Employee is on approved leave for the selected date"
            );
        }

        // 6. Check if already AI scheduled on this date
        boolean alreadyScheduled =
                aiScheduleRepository.existsByDateAndEmployeeId(
                        request.getDate(),
                        employee.getId()
                );

        if (alreadyScheduled) {
            throw new RuntimeException(
                    "Employee already has a schedule for the selected date"
            );
        }

        // 7. Get all shifts and compare only employee department shifts
        List<Shift> departmentShifts =
                shiftRepository.findAll()
                        .stream()
                        .filter(shift ->
                                shift.getDepartment() != null &&
                                shift.getDepartment()
                                        .equalsIgnoreCase(
                                                employee.getDepartment()
                                        )
                        )
                        .filter(shift ->
                                shift.getStatus() == null ||
                                shift.getStatus()
                                        .equalsIgnoreCase("Active")
                        )
                        .toList();

        if (departmentShifts.isEmpty()) {
            throw new RuntimeException(
                    "No active shifts available for employee department"
            );
        }

        AIShiftRecommendation bestRecommendation = null;

        // 8. Analyze every department shift
        for (Shift shift : departmentShifts) {

        	var assignments =
        	        shiftAssignmentRepository
        	                .findByShiftId(shift.getId());

        	// Employees already AI scheduled
        	// for this exact date + shift
        	var aiScheduledEmployees =
        	        aiScheduleRepository.findByDateAndShift(
        	                request.getDate(),
        	                shift.getId()
        	        );

        	int staticAssignedCount = assignments.size();

        	int aiScheduledCount = aiScheduledEmployees.size();

        	int totalAssignedCount =
        	        staticAssignedCount + aiScheduledCount;

        	int shortage =
        	        shift.getRequiredEmployees()
        	                - totalAssignedCount;
        	
        	// Do not recommend a shift that is already full
        	if (shortage <= 0) {
        	    continue;
        	}

            /*
             * Full shift = low priority if already full.
             * Positive shortage = stronger priority.
             */
            double score = 0;

            List<String> reasons = new ArrayList<>();

            if (shortage > 0) {

                score += 50;

                // More shortage = higher need
                score += shortage * 5;

                reasons.add(
                        "This shift currently requires additional staff"
                );

            } else {

                score -= 30;

                reasons.add(
                        "This shift currently has enough assigned staff"
                );
            }

            // 9. Role coverage analysis
            int supervisorCount = 0;
            int csaCount = 0;

            // Count normal Shift Assignments
            for (var assignment : assignments) {

                Employee assignedEmployee =
                        employeeRepository
                                .findById(
                                        assignment.getEmployeeId()
                                )
                                .orElse(null);

                if (assignedEmployee == null) {
                    continue;
                }

                if ("Supervisor".equalsIgnoreCase(
                        assignedEmployee.getRole())) {

                    supervisorCount++;

                } else if ("CSA".equalsIgnoreCase(
                        assignedEmployee.getRole())) {

                    csaCount++;
                }
            }

            // Count employees already AI scheduled
            // for this date + shift
            for (var aiSchedule : aiScheduledEmployees) {

                Employee aiEmployee =
                        employeeRepository
                                .findById(
                                        aiSchedule.getEmployeeId()
                                )
                                .orElse(null);

                if (aiEmployee == null) {
                    continue;
                }

                if ("Supervisor".equalsIgnoreCase(
                        aiEmployee.getRole())) {

                    supervisorCount++;

                } else if ("CSA".equalsIgnoreCase(
                        aiEmployee.getRole())) {

                    csaCount++;
                }
            }

            int requiredSupervisors =
                    "Dry".equalsIgnoreCase(
                            employee.getDepartment())
                            ? 2
                            : 1;

            int requiredCSA =
                    "Dry".equalsIgnoreCase(
                            employee.getDepartment())
                            ? 4
                            : 2;

            if ("Supervisor".equalsIgnoreCase(
                    employee.getRole()) &&
                supervisorCount < requiredSupervisors) {

                score += 30;

                reasons.add(
                        "Supervisor coverage is required for this shift"
                );
            }

            if ("CSA".equalsIgnoreCase(
                    employee.getRole()) &&
                csaCount < requiredCSA) {

                score += 25;

                reasons.add(
                        "CSA coverage is required for this shift"
                );
            }

            // 10. Attendance / overtime analysis
            List<Attendance> attendanceHistory =
                    attendanceRepository
                            .findByEmployeeId(employee.getId());

            if (attendanceHistory.isEmpty()) {

                score += 10;

                reasons.add(
                        "No negative attendance history"
                );

            } else {

                long lateCount =
                        attendanceHistory.stream()
                                .filter(a ->
                                        "Late".equalsIgnoreCase(
                                                a.getStatus()))
                                .count();

                long absentCount =
                        attendanceHistory.stream()
                                .filter(a ->
                                        "Absent".equalsIgnoreCase(
                                                a.getStatus()))
                                .count();

                if (lateCount <= 2) {
                    score += 10;
                    reasons.add(
                            "Good attendance punctuality"
                    );
                } else {
                    score -= 5;
                }

                if (absentCount <= 2) {
                    score += 10;
                    reasons.add(
                            "Good attendance availability"
                    );
                } else {
                    score -= 10;
                }

                double totalOvertimeHours = 0;

                for (Attendance attendance :
                        attendanceHistory) {

                    totalOvertimeHours +=
                            parseOvertimeHours(
                                    attendance.getOvertime()
                            );
                }

                if (totalOvertimeHours <= 5) {

                    score += 15;

                    reasons.add(
                            "Low overtime workload"
                    );

                } else if (totalOvertimeHours <= 15) {

                    score += 10;

                    reasons.add(
                            "Acceptable overtime workload"
                    );

                } else if (totalOvertimeHours > 25) {

                    score -= 15;

                    reasons.add(
                            "High overtime workload considered"
                    );
                }
            }

            // 11. Employee matches department
            score += 20;

            reasons.add(
                    "Employee belongs to the " +
                    employee.getDepartment() +
                    " department"
            );

            // 12. Employee is available
            reasons.add(
                    "Employee is available on the selected date"
            );

            AIShiftRecommendation recommendation =
                    new AIShiftRecommendation(
                            employee.getId(),
                            employee.getName(),
                            employee.getDepartment(),
                            employee.getRole(),
                            shift.getId(),
                            shift.getName(),
                            shift.getStartTime(),
                            shift.getEndTime(),
                            request.getDate(),
                            score,
                            reasons
                    );

            // 13. Keep highest-scoring shift
            if (bestRecommendation == null ||
                recommendation.getScore() >
                bestRecommendation.getScore()) {

                bestRecommendation = recommendation;
            }
        }

        if (bestRecommendation == null) {
            throw new RuntimeException(
                    "AI could not find a suitable shift"
            );
        }

        return bestRecommendation;
    }
    
    public AIWeeklyScheduleResponse generateWeeklySchedule(
            AIWeeklyScheduleRequest request) {

        // 1. Validate department
        if (request.getDepartment() == null ||
            request.getDepartment().isBlank()) {

            throw new RuntimeException(
                    "Department is required"
            );
        }

        // 2. Validate week start date
        if (request.getWeekStartDate() == null ||
            request.getWeekStartDate().isBlank()) {

            throw new RuntimeException(
                    "Week start date is required"
            );
        }

        LocalDate weekStart;

        try {
            weekStart =
                    LocalDate.parse(
                            request.getWeekStartDate()
                    );
        } catch (Exception e) {
            throw new RuntimeException(
                    "Invalid week start date"
            );
        }

        // Weekly schedule must always start on Monday
        if (weekStart.getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new RuntimeException(
                    "Week start date must be a Monday"
            );
        }

        LocalDate weekEnd =
                weekStart.plusDays(6);
        
     // =====================================================
     // 4-WEEK WORK CYCLE
     // =====================================================

     // Use 2026-09-28 Monday as the beginning of the
     // first 4-week scheduling/payroll cycle.
     LocalDate cycleReferenceDate =
             LocalDate.of(2026, 9, 28);

     long daysFromReference =
             java.time.temporal.ChronoUnit.DAYS.between(
                     cycleReferenceDate,
                     weekStart
             );

     long cycleNumber =
             Math.floorDiv(daysFromReference, 28);

     LocalDate cycleStartDate =
             cycleReferenceDate.plusDays(
                     cycleNumber * 28
             );

     LocalDate cycleEndDate =
             cycleStartDate.plusDays(27);

     long weekOffset =
             java.time.temporal.ChronoUnit.WEEKS.between(
                     cycleStartDate,
                     weekStart
             );

     int cycleWeekNumber =
             (int) weekOffset + 1;

        // 3. Find active employees in selected department
        List<Employee> departmentEmployees =
                employeeRepository.findAll()
                        .stream()
                        .filter(employee ->
                                employee.getDepartment() != null &&
                                employee.getDepartment()
                                        .equalsIgnoreCase(
                                                request.getDepartment()
                                        )
                        )
                        .filter(employee ->
                                employee.getStatus() == null ||
                                employee.getStatus()
                                        .equalsIgnoreCase("Active")
                        )
                        .filter(employee ->
                                !"Manager".equalsIgnoreCase(
                                        employee.getRole()
                                ) &&
                                !"Executive".equalsIgnoreCase(
                                        employee.getRole()
                                )
                        )
                        .toList();

        if (departmentEmployees.isEmpty()) {
            throw new RuntimeException(
                    "No active employees found for selected department"
            );
        }

        List<AIWeeklyScheduleItem> schedule =
                new ArrayList<>();
        
     // =====================================================
     // SUPERVISOR WEEKLY SCHEDULING
     // =====================================================

     List<Employee> supervisors =
             departmentEmployees.stream()
                     .filter(employee ->
                             "Supervisor".equalsIgnoreCase(
                                     employee.getRole()
                             )
                     )
                     .toList();

     int requiredSupervisors =
             "Dry".equalsIgnoreCase(
                     request.getDepartment()
             ) ? 2 : 1;

     if (supervisors.size() < requiredSupervisors) {
         throw new RuntimeException(
                 "Not enough Supervisors in " +
                 request.getDepartment() +
                 " department"
         );
     }

     for (int supervisorIndex = 0;
          supervisorIndex < supervisors.size();
          supervisorIndex++) {

         Employee supervisor =
                 supervisors.get(supervisorIndex);

         int fullDaysAssigned = 0;
         
         var supervisorCycleSchedules =
        	        aiScheduleRepository
        	                .findByEmployeeIdAndDateBetween(
        	                        supervisor.getId(),
        	                        cycleStartDate.toString(),
        	                        cycleEndDate.toString()
        	                );

        	long savedOffCount =
        	        supervisorCycleSchedules.stream()
        	                .filter(savedSchedule ->
        	                        "OFF".equalsIgnoreCase(
        	                                savedSchedule.getShift()
        	                        )
        	                )
        	                .count();

        	int remainingOffDays =
        	        Math.max(
        	                0,
        	                3 - (int) savedOffCount
        	        );
         
      // One OFF in cycle weeks 1, 2 and 3.
      // Cycle week 4 has no OFF.
      // Different supervisors receive different OFF days.
        	List<Integer> supervisorOffDays =
        	        new ArrayList<>();

        	int[] allowedOffDays = {
        	        1, // Tuesday
        	        4, // Friday
        	        5  // Saturday
        	};

        	if (remainingOffDays > 0) {

        	    if (cycleWeekNumber >= 1 &&
        	        cycleWeekNumber <= 3) {

        	        int offDay =
        	                allowedOffDays[
        	                        (cycleWeekNumber - 1 + supervisorIndex)
        	                                % allowedOffDays.length
        	                ];

        	        supervisorOffDays.add(offDay);

        	    } else if (cycleWeekNumber == 4) {

        	        int offsToAssignThisWeek =
        	                Math.min(
        	                        remainingOffDays,
        	                        allowedOffDays.length
        	                );

        	        for (int i = 0;
        	             i < offsToAssignThisWeek;
        	             i++) {

        	            int offDay =
        	                    allowedOffDays[
        	                            (i + supervisorIndex)
        	                                    % allowedOffDays.length
        	                    ];

        	            if (!supervisorOffDays.contains(offDay)) {
        	                supervisorOffDays.add(offDay);
        	            }
        	        }
        	    }
        	}

         /*
          * Wednesday and Sunday are mandatory Full Days.
          * Remaining two Full Days are rotated between
          * supervisors to avoid identical weekly patterns.
          */
         
      int firstExtraDay =
    	        supervisorIndex % 2 == 0 ? 0 : 1;

    	int secondExtraDay =
    	        supervisorIndex % 2 == 0 ? 3 : 4;

    	// If an OFF day clashes with one of the two extra Full Days,
    	// move that Full Day to another available non-mandatory day.
    	int[] replacementDays = {0, 1, 3, 4, 5};

    	if (supervisorOffDays.contains(firstExtraDay)) {

    	    for (int replacementDay : replacementDays) {

    	        if (!supervisorOffDays.contains(replacementDay) &&
    	            replacementDay != secondExtraDay) {

    	            firstExtraDay = replacementDay;
    	            break;
    	        }
    	    }
    	}

    	if (supervisorOffDays.contains(secondExtraDay)) {

    	    for (int replacementDay : replacementDays) {

    	        if (!supervisorOffDays.contains(replacementDay) &&
    	            replacementDay != firstExtraDay) {

    	            secondExtraDay = replacementDay;
    	            break;
    	        }
    	    }
    	}

         for (int dayIndex = 0;
              dayIndex < 7;
              dayIndex++) {

             LocalDate currentDate =
                     weekStart.plusDays(dayIndex);

             // Approved leave = no schedule for this date
             if (isOnApprovedLeave(
                     supervisor.getId(),
                     currentDate.toString())) {

                 schedule.add(
                         new AIWeeklyScheduleItem(
                                 supervisor.getId(),
                                 supervisor.getName(),
                                 supervisor.getDepartment(),
                                 supervisor.getRole(),
                                 currentDate.toString(),
                                 currentDate.getDayOfWeek().toString(),
                                 "LEAVE",
                                 "",
                                 "",
                                 "Approved leave"
                         )
                 );

                 continue;
             }

             boolean mandatoryFullDay =
                     currentDate.getDayOfWeek()
                             == DayOfWeek.WEDNESDAY ||
                     currentDate.getDayOfWeek()
                             == DayOfWeek.SUNDAY;

             boolean extraFullDay =
            	        dayIndex == firstExtraDay ||
            	        dayIndex == secondExtraDay;

             boolean supervisorOff =
            	        supervisorOffDays.contains(dayIndex);

            	// OFF must never override Wednesday/Sunday mandatory coverage
            	if (supervisorOff && !mandatoryFullDay) {

            	    schedule.add(
            	            new AIWeeklyScheduleItem(
            	                    supervisor.getId(),
            	                    supervisor.getName(),
            	                    supervisor.getDepartment(),
            	                    supervisor.getRole(),
            	                    currentDate.toString(),
            	                    currentDate.getDayOfWeek().toString(),
            	                    "OFF",
            	                    "",
            	                    "",
            	                    "Supervisor scheduled monthly OFF"
            	            )
            	    );

            	    continue;
            	}

            	if (mandatoryFullDay || extraFullDay) {

                 schedule.add(
                         new AIWeeklyScheduleItem(
                                 supervisor.getId(),
                                 supervisor.getName(),
                                 supervisor.getDepartment(),
                                 supervisor.getRole(),
                                 currentDate.toString(),
                                 currentDate.getDayOfWeek().toString(),
                                 "Full Day",
                                 "06:00",
                                 "23:00",
                                 mandatoryFullDay
                                         ? "Mandatory Supervisor Full Day coverage"
                                         : "AI balanced Supervisor weekly Full Day"
                         )
                 );

                 fullDaysAssigned++;

             }  else {

            	    String shiftType;
            	    String startTime;
            	    String endTime;

            	    int rotation =
            	            (dayIndex + supervisorIndex) % 4;

            	    if (rotation == 0) {
            	        shiftType = "Morning";
            	        startTime = "06:00";
            	        endTime = "15:00";

            	    } else if (rotation == 1) {
            	        shiftType = "Evening";
            	        startTime = "14:00";
            	        endTime = "23:00";

            	    } else if (rotation == 2) {
            	        shiftType = "Half Day Morning";
            	        startTime = "06:00";
            	        endTime = "11:00";

            	    } else {
            	        shiftType = "Half Day Evening";
            	        startTime = "16:00";
            	        endTime = "23:00";
            	    }

            	    schedule.add(
            	            new AIWeeklyScheduleItem(
            	                    supervisor.getId(),
            	                    supervisor.getName(),
            	                    supervisor.getDepartment(),
            	                    supervisor.getRole(),
            	                    currentDate.toString(),
            	                    currentDate.getDayOfWeek().toString(),
            	                    shiftType,
            	                    startTime,
            	                    endTime,
            	                    "AI balanced Supervisor non-Full-Day shift"
            	            )
            	    );
            	}
         }

         /*
          * If approved leave prevented the normal
          * four Full Days, record it for manager visibility.
          */
         if (fullDaysAssigned < 4) {
             // Later CSA logic will provide coverage.
         }
     }
     
  // =====================================================
  // CSA WEEKLY SCHEDULING
  // =====================================================

  List<Employee> csaEmployees =
          departmentEmployees.stream()
                  .filter(employee ->
                          "CSA".equalsIgnoreCase(
                                  employee.getRole()
                          )
                  )
                  .toList();

  int requiredCSA =
          "Dry".equalsIgnoreCase(
                  request.getDepartment()
          ) ? 4 : 2;

  if (csaEmployees.size() < requiredCSA) {
      throw new RuntimeException(
              "Not enough CSA employees in " +
              request.getDepartment() +
              " department"
      );
  }

  for (int dayIndex = 0;
       dayIndex < 7;
       dayIndex++) {

      LocalDate currentDate =
              weekStart.plusDays(dayIndex);

      String date =
              currentDate.toString();

      /*
       * Check whether at least one Supervisor
       * is working Full Day on this date.
       */
      boolean supervisorAvailable =
              schedule.stream()
                      .anyMatch(item ->
                              item.getDate().equals(date) &&
                              "Supervisor".equalsIgnoreCase(
                                      item.getRole()
                              ) &&
                              "Full Day".equalsIgnoreCase(
                                      item.getShiftType()
                              )
                      );

      /*
       * Rotate which CSA receives the primary
       * Full Day responsibility.
       */
   // Find CSAs who are actually available today
      List<Employee> availableCSAs =
              csaEmployees.stream()
                      .filter(csa ->
                              !isOnApprovedLeave(
                                      csa.getId(),
                                      date
                              )
                      )
                      .toList();

      if (availableCSAs.isEmpty()) {
          throw new RuntimeException(
                  "No CSA available for department coverage on "
                  + date
          );
      }

      // Rotate Full Day fairly only among available CSAs
      Employee primaryCSA =
              availableCSAs.get(
                      dayIndex % availableCSAs.size()
              );

      boolean fullDayCSAAssigned = false;

      for (int csaIndex = 0;
           csaIndex < csaEmployees.size();
           csaIndex++) {

          Employee csa =
                  csaEmployees.get(csaIndex);

          // Approved leave
          if (isOnApprovedLeave(
                  csa.getId(),
                  date)) {

              schedule.add(
                      new AIWeeklyScheduleItem(
                              csa.getId(),
                              csa.getName(),
                              csa.getDepartment(),
                              csa.getRole(),
                              date,
                              currentDate
                                      .getDayOfWeek()
                                      .toString(),
                              "LEAVE",
                              "",
                              "",
                              "Approved leave"
                      )
              );

              continue;
          }

          /*
           * Primary CSA gets Full Day.
           *
           * If the selected primary CSA is on leave,
           * the first available CSA becomes Full Day.
           */
          boolean shouldWorkFullDay =
        	        csa.getId().equals(
        	                primaryCSA.getId()
        	        );

          if (!supervisorAvailable &&
              !fullDayCSAAssigned) {

              shouldWorkFullDay = true;
          }

          if (shouldWorkFullDay &&
              !fullDayCSAAssigned) {

              schedule.add(
                      new AIWeeklyScheduleItem(
                              csa.getId(),
                              csa.getName(),
                              csa.getDepartment(),
                              csa.getRole(),
                              date,
                              currentDate
                                      .getDayOfWeek()
                                      .toString(),
                              "Full Day",
                              "06:00",
                              "23:00",
                              !supervisorAvailable
                                      ? "Full Day required because Supervisor is unavailable"
                                      : "AI balanced CSA Full Day rotation"
                      )
              );

              fullDayCSAAssigned = true;

          } else {

              /*
               * Other CSA staff rotate through
               * Half Day Morning / Half Day Evening /
               * Morning / Evening.
               */
              int rotation =
                      (dayIndex + csaIndex) % 4;

              String shiftType;
              String startTime;
              String endTime;

              if (rotation == 0) {

                  shiftType = "Half Day Morning";
                  startTime = "06:00";
                  endTime = "11:00";

              } else if (rotation == 1) {

                  shiftType = "Half Day Evening";
                  startTime = "16:00";
                  endTime = "23:00";

              } else if (rotation == 2) {

                  shiftType = "Morning";
                  startTime = "06:00";
                  endTime = "15:00";

              } else {

                  shiftType = "Evening";
                  startTime = "14:00";
                  endTime = "23:00";
              }

              schedule.add(
                      new AIWeeklyScheduleItem(
                              csa.getId(),
                              csa.getName(),
                              csa.getDepartment(),
                              csa.getRole(),
                              date,
                              currentDate
                                      .getDayOfWeek()
                                      .toString(),
                              shiftType,
                              startTime,
                              endTime,
                              "AI balanced CSA shift rotation"
                      )
              );
          }
      }

      /*
       * Safety check:
       * If every CSA is on approved leave and
       * Supervisor is unavailable, department
       * coverage cannot be maintained.
       */
      if (!supervisorAvailable &&
          !fullDayCSAAssigned) {

          throw new RuntimeException(
                  "Supervisor and CSA coverage cannot be maintained on "
                  + date
          );
      }
  }
  
//=====================================================
//EMPLOYEE WEEKLY SCHEDULING
//=====================================================

List<Employee> regularEmployees =
       departmentEmployees.stream()
               .filter(employee ->
                       "Employee".equalsIgnoreCase(
                               employee.getRole()
                       )
               )
               .toList();

int requiredEmployees =
       "Dry".equalsIgnoreCase(
               request.getDepartment()
       ) ? 10 : 5;

if (regularEmployees.size() < requiredEmployees) {
   throw new RuntimeException(
           "Not enough regular Employees in " +
           request.getDepartment() +
           " department. Required: " +
           requiredEmployees +
           ", Available: " +
           regularEmployees.size()
   );
}

for (int employeeIndex = 0;
    employeeIndex < regularEmployees.size();
    employeeIndex++) {

   Employee employee =
           regularEmployees.get(employeeIndex);

   int fullDaysAssigned = 0;

   /*
    * Rotate the starting day between employees.
    * This prevents everyone receiving the
    * same Full Day pattern.
    */
   int rotationOffset =
           employeeIndex % 7;

   /*
    * First identify the employee's
    * available dates.
    */
   List<Integer> availableDays =
           new ArrayList<>();

   for (int dayIndex = 0;
        dayIndex < 7;
        dayIndex++) {

       LocalDate currentDate =
               weekStart.plusDays(dayIndex);

       if (!isOnApprovedLeave(
               employee.getId(),
               currentDate.toString())) {

           availableDays.add(dayIndex);
       }
   }

   /*
    * Choose up to 3 Full Days.
    * Spread them across the week.
    */
   List<Integer> fullDayIndices =
           new ArrayList<>();

   for (int offset = 0;
        offset < 7 &&
        fullDayIndices.size() < 3;
        offset++) {

       int dayIndex =
               (rotationOffset + offset * 2) % 7;

       if (availableDays.contains(dayIndex) &&
           !fullDayIndices.contains(dayIndex)) {

           fullDayIndices.add(dayIndex);
       }
   }

   /*
    * If the first rotation could not find
    * 3 days, fill from remaining available days.
    */
   for (int dayIndex : availableDays) {

       if (fullDayIndices.size() >= 3) {
           break;
       }

       if (!fullDayIndices.contains(dayIndex)) {
           fullDayIndices.add(dayIndex);
       }
   }

   // Generate all 7 daily schedule entries
   for (int dayIndex = 0;
        dayIndex < 7;
        dayIndex++) {

       LocalDate currentDate =
               weekStart.plusDays(dayIndex);

       String date =
               currentDate.toString();

       String day =
               currentDate.getDayOfWeek()
                       .toString();

       // Approved leave takes priority
       if (isOnApprovedLeave(
               employee.getId(),
               date)) {

           schedule.add(
                   new AIWeeklyScheduleItem(
                           employee.getId(),
                           employee.getName(),
                           employee.getDepartment(),
                           employee.getRole(),
                           date,
                           day,
                           "LEAVE",
                           "",
                           "",
                           "Approved leave - no shift assigned"
                   )
           );

           continue;
       }

       // Selected Full Day
       if (fullDayIndices.contains(dayIndex)) {

           schedule.add(
                   new AIWeeklyScheduleItem(
                           employee.getId(),
                           employee.getName(),
                           employee.getDepartment(),
                           employee.getRole(),
                           date,
                           day,
                           "Full Day",
                           "06:00",
                           "23:00",
                           "AI selected one of the employee's three weekly Full Days"
                   )
           );

           fullDaysAssigned++;

           continue;
       }

       /*
        * Other available days:
        * Morning / Evening /
        * Half Day Morning / Half Day Evening
        */
       int shiftRotation =
               (dayIndex + employeeIndex) % 4;

       String shiftType;
       String startTime;
       String endTime;

       switch (shiftRotation) {

           case 0:
               shiftType = "Morning";
               startTime = "06:00";
               endTime = "15:00";
               break;

           case 1:
               shiftType = "Evening";
               startTime = "14:00";
               endTime = "23:00";
               break;

           case 2:
               shiftType = "Half Day Morning";
               startTime = "06:00";
               endTime = "11:00";
               break;

           default:
               shiftType = "Half Day Evening";
               startTime = "16:00";
               endTime = "23:00";
               break;
       }

       schedule.add(
               new AIWeeklyScheduleItem(
                       employee.getId(),
                       employee.getName(),
                       employee.getDepartment(),
                       employee.getRole(),
                       date,
                       day,
                       shiftType,
                       startTime,
                       endTime,
                       "AI balanced weekly shift rotation"
               )
       );
   }

   /*
    * Approved leave may prevent
    * the normal 3 Full Days.
    */
   if (fullDaysAssigned < 3) {

       // Notes will be added in the next step.
       // The employee's approved leave is respected.
   }
}

        List<String> notes =
                new ArrayList<>();

        notes.add(
                "Weekly schedule generated for Monday to Sunday"
        );

        notes.add(
                "Approved employee leave will be considered"
        );

        notes.add(
                "Supervisor and CSA department coverage will be maintained"
        );

        notes.add(
                "Employee workload will be distributed across available shift types"
        );

        return new AIWeeklyScheduleResponse(
                request.getDepartment(),
                weekStart.toString(),
                weekEnd.toString(),
                departmentEmployees.size(),
                schedule,
                notes
        );
    }
    
    public AIReplacementRecommendation recommendReplacement(
            Long scheduleId) {

        // 1. Find affected saved schedule
        AISchedule affectedSchedule =
                aiScheduleRepository
                        .findById(scheduleId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "AI schedule not found"
                                ));

        // OFF does not need replacement
        if ("OFF".equalsIgnoreCase(
                affectedSchedule.getShift())) {

            throw new RuntimeException(
                    "OFF schedule does not require replacement"
            );
        }

        // 2. Original employee
        Employee absentEmployee =
                employeeRepository
                        .findById(
                                affectedSchedule.getEmployeeId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Original employee not found"
                                ));

        String date =
                affectedSchedule.getDate();

        String department =
                affectedSchedule.getDepartment();

        // Replacement is only needed when employee
        // has approved leave on this date
        if (!isOnApprovedLeave(
                absentEmployee.getId(),
                date)) {

            throw new RuntimeException(
                    "Employee does not have approved leave on "
                    + date
            );
        }

        // 3. Find candidates
        List<Employee> candidates =
                employeeRepository.findAll()
                        .stream()

                        // Same department
                        .filter(employee ->
                                employee.getDepartment() != null &&
                                employee.getDepartment()
                                        .equalsIgnoreCase(
                                                department
                                        )
                        )

                        // Active only
                        .filter(employee ->
                                employee.getStatus() == null ||
                                employee.getStatus()
                                        .equalsIgnoreCase("Active")
                        )

                        // Cannot replace with same employee
                        .filter(employee ->
                                !employee.getId()
                                        .equals(
                                                absentEmployee.getId()
                                        )
                        )

                        // Manager / Executive excluded
                        .filter(employee ->
                                !"Manager".equalsIgnoreCase(
                                        employee.getRole()
                                ) &&
                                !"Executive".equalsIgnoreCase(
                                        employee.getRole()
                                )
                        )

                        // Candidate cannot be on leave
                        .filter(employee ->
                                !isOnApprovedLeave(
                                        employee.getId(),
                                        date
                                )
                        )

                        // Candidate cannot already have schedule that day
                        .filter(employee -> {

                            var existingSchedule =
                                    aiScheduleRepository
                                            .findByDateAndEmployeeId(
                                                    date,
                                                    employee.getId()
                                            );

                            // No schedule = available
                            if (existingSchedule.isEmpty()) {
                                return true;
                            }

                            // OFF employee = available for emergency replacement
                            return "OFF".equalsIgnoreCase(
                                    existingSchedule.get().getShift()
                            );
                        })
                        .toList();

        if (candidates.isEmpty()) {

            throw new RuntimeException(
                    "No available replacement employee found"
            );
        }

        // 4. Role-aware candidate selection
        Employee replacement = null;

        String absentRole =
                absentEmployee.getRole();

        // Exact same role first
        for (Employee candidate : candidates) {

            if (candidate.getRole() != null &&
                candidate.getRole()
                        .equalsIgnoreCase(absentRole)) {

                replacement = candidate;
                break;
            }
        }

        /*
         * Business rule:
         * If Supervisor is unavailable,
         * CSA can provide coverage.
         */
        if (replacement == null &&
            "Supervisor".equalsIgnoreCase(absentRole)) {

            for (Employee candidate : candidates) {

                if ("CSA".equalsIgnoreCase(
                        candidate.getRole())) {

                    replacement = candidate;
                    break;
                }
            }
        }

        // Last fallback: another eligible department employee
        if (replacement == null) {
            replacement = candidates.get(0);
        }

        // 5. Build recommendation
        AIReplacementRecommendation result =
                new AIReplacementRecommendation();

        result.setScheduleId(
                affectedSchedule.getId()
        );

        result.setAbsentEmployeeId(
                absentEmployee.getId()
        );

        result.setAbsentEmployeeName(
                absentEmployee.getName()
        );

        result.setReplacementEmployeeId(
                replacement.getId()
        );

        result.setReplacementEmployeeName(
                replacement.getName()
        );

        result.setDepartment(
                department
        );

        result.setDate(
                date
        );

        result.setShift(
                affectedSchedule.getShift()
        );

        result.setReason(
                "Recommended because the original employee "
                + "is on approved leave. Replacement is active, "
                + "available, belongs to the same department "
                + "and has no schedule conflict."
        );

        return result;
    }
    
    public AISchedule confirmReplacement(
            Long scheduleId,
            String replacementEmployeeId) {

        AISchedule schedule =
                aiScheduleRepository
                        .findById(scheduleId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "AI schedule not found"
                                ));

        if ("OFF".equalsIgnoreCase(schedule.getShift())) {
            throw new RuntimeException(
                    "OFF schedule cannot be replaced"
            );
        }

        Employee originalEmployee =
                employeeRepository
                        .findById(schedule.getEmployeeId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Original employee not found"
                                ));

        if (!isOnApprovedLeave(
                originalEmployee.getId(),
                schedule.getDate())) {

            throw new RuntimeException(
                    "Original employee is not on approved leave"
            );
        }

        Employee replacement =
                employeeRepository
                        .findById(replacementEmployeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Replacement employee not found"
                                ));

        if (replacement.getStatus() != null &&
            !"Active".equalsIgnoreCase(
                    replacement.getStatus())) {

            throw new RuntimeException(
                    "Replacement employee is not active"
            );
        }

        if (replacement.getDepartment() == null ||
            !replacement.getDepartment()
                    .equalsIgnoreCase(
                            schedule.getDepartment())) {

            throw new RuntimeException(
                    "Replacement must belong to the same department"
            );
        }

        if (replacement.getId()
                .equals(originalEmployee.getId())) {

            throw new RuntimeException(
                    "Replacement cannot be the same employee"
            );
        }

        if (isOnApprovedLeave(
                replacement.getId(),
                schedule.getDate())) {

            throw new RuntimeException(
                    "Replacement employee is on approved leave"
            );
        }

        var replacementExistingSchedule =
                aiScheduleRepository
                        .findByDateAndEmployeeId(
                                schedule.getDate(),
                                replacement.getId()
                        );

        if (replacementExistingSchedule.isPresent() &&
            !"OFF".equalsIgnoreCase(
                    replacementExistingSchedule.get().getShift()
            )) {

            throw new RuntimeException(
                    "Replacement employee already has a working schedule on this date"
            );
        }

        // If replacement had OFF, remove that OFF record
        if (replacementExistingSchedule.isPresent()) {

            aiScheduleRepository.delete(
                    replacementExistingSchedule.get()
            );
        }

        schedule.setEmployeeId(
                replacement.getId()
        );

        schedule.setEmployeeName(
                replacement.getName()
        );

        return aiScheduleRepository.save(schedule);
    }

    private boolean isOnApprovedLeave(
            String employeeId,
            String selectedDate) {

        if (selectedDate == null ||
            selectedDate.isBlank()) {
            return false;
        }

        List<LeaveRequest> approvedLeaves =
                leaveRequestRepository
                        .findByEmployeeIdAndStatus(
                                employeeId,
                                "Approved"
                        );

        for (LeaveRequest leave : approvedLeaves) {

            String startDate =
                    leave.getStartDate();

            String endDate =
                    leave.getEndDate();

            if (startDate == null ||
                endDate == null) {
                continue;
            }

            boolean afterOrEqualStart =
                    selectedDate.compareTo(startDate) >= 0;

            boolean beforeOrEqualEnd =
                    selectedDate.compareTo(endDate) <= 0;

            if (afterOrEqualStart &&
                beforeOrEqualEnd) {

                return true;
            }
        }

        return false;
    }
    
    private double parseOvertimeHours(String overtime) {

        if (overtime == null ||
            overtime.isBlank()) {
            return 0;
        }

        try {

            String cleaned =
                    overtime.toLowerCase()
                            .replace("hours", "")
                            .replace("hour", "")
                            .replace("hrs", "")
                            .replace("hr", "")
                            .replace("h", "")
                            .trim();

            return Double.parseDouble(cleaned);

        } catch (NumberFormatException e) {

            /*
             * Supports values such as:
             * "2h 30m"
             */
            try {

                double hours = 0;

                String value =
                        overtime.toLowerCase().trim();

                if (value.contains("h")) {

                    String hourPart =
                            value.substring(
                                    0,
                                    value.indexOf("h")
                            ).trim();

                    hours += Double.parseDouble(hourPart);

                    value =
                            value.substring(
                                    value.indexOf("h") + 1
                            ).trim();
                }

                if (value.contains("m")) {

                    String minutePart =
                            value.substring(
                                    0,
                                    value.indexOf("m")
                            ).trim();

                    hours +=
                            Double.parseDouble(minutePart) / 60.0;
                }

                return hours;

            } catch (Exception ignored) {
                return 0;
            }
        }
    }
    
}