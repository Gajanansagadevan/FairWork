package com.fairwork.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fairwork.entity.Payroll;
import com.fairwork.service.PayrollService;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping
    public List<Payroll> getAllPayrolls() {
        return payrollService.getAllPayrolls();
    }

    @PostMapping
    public Payroll createPayroll(@RequestBody Payroll payroll) {
        return payrollService.savePayroll(payroll);
    }
    
    @PostMapping("/generate-four-week")
    public Payroll generateFourWeekPayroll(
            @RequestBody Map<String, Object> request
    ) {

        String employeeId =
                request.get("employeeId").toString();

        String cycleStartDate =
                request.get("cycleStartDate").toString();

        double allowances =
                request.get("allowances") == null
                        ? 0.0
                        : Double.parseDouble(
                                request.get("allowances").toString()
                        );

        double deductions =
                request.get("deductions") == null
                        ? 0.0
                        : Double.parseDouble(
                                request.get("deductions").toString()
                        );

        return payrollService.generateFourWeekPayroll(
                employeeId,
                cycleStartDate,
                allowances,
                deductions
        );
    }

    @PutMapping("/{id}")
    public Payroll updatePayroll(
            @PathVariable String id,
            @RequestBody Payroll payroll
    ) {
        return payrollService.updatePayroll(id, payroll);
    }

    @DeleteMapping("/{id}")
    public void deletePayroll(@PathVariable String id) {
        payrollService.deletePayroll(id);
    }
}