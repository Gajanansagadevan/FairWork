package com.fairwork.repository;
import java.util.List;

import java.util.Optional;
import com.fairwork.entity.AISchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AIScheduleRepository
        extends JpaRepository<AISchedule, Long> {

    boolean existsByDateAndShiftAndDepartmentAndEmployeeId(
            String date,
            String shift,
            String department,
            String employeeId
    );

    boolean existsByDateAndEmployeeId(
            String date,
            String employeeId
    );
    
    List<AISchedule> findByDateAndShift(
            String date,
            String shift
    );
    
    List<AISchedule> findByEmployeeIdAndDateBetween(
            String employeeId,
            String startDate,
            String endDate
    );
    
    java.util.Optional<AISchedule> findByDateAndEmployeeId(
            String date,
            String employeeId
    );
    
}