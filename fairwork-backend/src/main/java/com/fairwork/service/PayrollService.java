package com.fairwork.service;
import java.util.UUID;

import com.fairwork.exception.ConflictException;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fairwork.entity.Payroll;
import com.fairwork.repository.PayrollRepository;

import java.time.LocalDate;

import com.fairwork.entity.Attendance;
import com.fairwork.entity.Employee;
import com.fairwork.repository.AttendanceRepository;
import com.fairwork.repository.EmployeeRepository;
import com.fairwork.entity.AISchedule;
import com.fairwork.repository.AIScheduleRepository;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    
    private final AIScheduleRepository aiScheduleRepository;
    
    public PayrollService(
            PayrollRepository payrollRepository,
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            AIScheduleRepository aiScheduleRepository
    ) {
        this.payrollRepository = payrollRepository;
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.aiScheduleRepository = aiScheduleRepository;
    }

    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }
    
    public Payroll generateFourWeekPayroll(
            String employeeId,
            String cycleStartDate,
            double allowances,
            double deductions
    ) {

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: " + employeeId
                                )
                        );

        LocalDate cycleStart;

        try {
            cycleStart =
                    LocalDate.parse(cycleStartDate);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Invalid cycle start date"
            );
        }

        // 4 weeks = 28 days
        LocalDate cycleEnd =
                cycleStart.plusDays(27);
        
        LocalDate today = LocalDate.now();

        if (today.isBefore(cycleEnd)) {
            throw new RuntimeException(
                    "Payroll cannot be generated before the 4-week cycle ends. " +
                    "Cycle ends on: " + cycleEnd
            );
        }

        List<Attendance> attendanceRecords =
                attendanceRepository
                        .findByEmployeeIdAndDateBetween(
                                employeeId,
                                cycleStart.toString(),
                                cycleEnd.toString()
                        );
        
        List<AISchedule> scheduleRecords =
                aiScheduleRepository
                        .findByEmployeeIdAndDateBetween(
                                employeeId,
                                cycleStart.toString(),
                                cycleEnd.toString()
                        );

        int scheduledShiftDays =
                (int) scheduleRecords.stream()
                        .filter(schedule ->
                                schedule.getShift() != null &&
                                !"OFF".equalsIgnoreCase(
                                        schedule.getShift()
                                )
                        )
                        .count();

        double totalWorkingHours = 0.0;
        double totalOvertimeHours = 0.0;

        for (Attendance attendance : attendanceRecords) {

            totalWorkingHours +=
                    parseDurationHours(
                            attendance.getWorkingHours()
                    );

            totalOvertimeHours +=
                    parseDurationHours(
                            attendance.getOvertime()
                    );
        }

        double basicSalary =
                getBasicSalary(employee.getRole());

        double overtimeRate =
                getOvertimeRate(employee.getRole());

        double overtimePay =
                totalOvertimeHours * overtimeRate;

        double netSalary =
                basicSalary
                + overtimePay
                + allowances
                - deductions;

        String cycleLabel =
                cycleStart + "_to_" + cycleEnd;

        boolean alreadyExists =
                payrollRepository
                        .existsByEmployeeIdAndMonth(
                                employeeId,
                                cycleLabel
                        );

        if (alreadyExists) {
            throw new ConflictException(
                    "Payroll already exists for this employee and 4-week cycle"
            );
        }

        Payroll payroll = new Payroll();

        payroll.setId(
                UUID.randomUUID().toString()
        );

        payroll.setEmployeeId(
                employee.getId()
        );

        payroll.setName(
                employee.getName()
        );

        payroll.setDepartment(
                employee.getDepartment()
        );

        payroll.setMonth(cycleLabel);

        payroll.setBasicSalary(basicSalary);
        
        payroll.setBasicSalary(basicSalary);

        payroll.setWorkingHours(
                totalWorkingHours
        );

        payroll.setScheduledShiftDays(
                scheduledShiftDays
        );

        payroll.setOvertimeHours(
                totalOvertimeHours
        );

        payroll.setOvertimeHours(
                totalOvertimeHours
        );

        payroll.setAllowances(allowances);

        payroll.setDeductions(deductions);

        payroll.setNetSalary(netSalary);

        payroll.setStatus("Pending");

        System.out.println(
                "4-Week Payroll Generated -> "
                + employee.getId()
                + " | Cycle: "
                + cycleLabel
                + " | Working Hours: "
                + totalWorkingHours
                + " | OT Hours: "
                + totalOvertimeHours
                + " | OT Pay: "
                + overtimePay
                + " | Net Salary: "
                + netSalary
        );

        return payrollRepository.save(payroll);
    }

    public Payroll savePayroll(Payroll payroll) {

        boolean alreadyExists =
                payrollRepository.existsByEmployeeIdAndMonth(
                        payroll.getEmployeeId(),
                        payroll.getMonth()
                );

        if (alreadyExists) {
            throw new ConflictException(
                    "Payroll already exists for this employee and month"
            );
        }

        payroll.setId(UUID.randomUUID().toString());

        return payrollRepository.save(payroll);
    }

    public Payroll updatePayroll(String id, Payroll payroll) {
        payroll.setId(id);
        return payrollRepository.save(payroll);
    }

    public void deletePayroll(String id) {
        payrollRepository.deleteById(id);
    }
    
    private double getBasicSalary(String role) {

        if (role == null) {
            return 32000.0;
        }

        return switch (role) {

            case "Manager" ->
                    60000.0;

            case "Executive" ->
                    80000.0;

            case "Supervisor" ->
                    40000.0;

            case "SSA", "CSA", "Employee" ->
                    32000.0;

            default ->
                    32000.0;
        };
    }

    private double getOvertimeRate(String role) {

        if (role == null) {
            return 160.0;
        }

        return switch (role) {

            case "Manager",
                 "Executive",
                 "Supervisor" ->
                    180.0;

            case "SSA",
                 "CSA",
                 "Employee" ->
                    160.0;

            default ->
                    160.0;
        };
    }

    private double parseDurationHours(String value) {

        if (value == null ||
            value.isBlank() ||
            value.equals("-")) {

            return 0.0;
        }

        try {

            String normalized =
                    value.toLowerCase().trim();

            double hours = 0.0;
            double minutes = 0.0;

            if (normalized.contains("h")) {

                String hourPart =
                        normalized
                                .substring(
                                        0,
                                        normalized.indexOf("h")
                                )
                                .trim();

                if (!hourPart.isEmpty()) {
                    hours =
                            Double.parseDouble(
                                    hourPart
                            );
                }
            }

            if (normalized.contains("m")) {

                int hIndex =
                        normalized.contains("h")
                                ? normalized.indexOf("h") + 1
                                : 0;

                String minutePart =
                        normalized
                                .substring(
                                        hIndex,
                                        normalized.indexOf("m")
                                )
                                .trim();

                if (!minutePart.isEmpty()) {
                    minutes =
                            Double.parseDouble(
                                    minutePart
                            );
                }
            }

            return hours + (minutes / 60.0);

        } catch (Exception e) {

            System.out.println(
                    "Unable to parse duration: "
                    + value
            );

            return 0.0;
        }
    }
}