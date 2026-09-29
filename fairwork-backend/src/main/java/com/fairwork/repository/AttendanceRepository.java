package com.fairwork.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fairwork.entity.Attendance;

public interface AttendanceRepository
        extends JpaRepository<Attendance, String> {

    boolean existsByEmployeeIdAndDate(
            String employeeId,
            String date
    );

    List<Attendance> findAllByOrderByIdDesc();

    List<Attendance> findByEmployeeId(
            String employeeId
    );

    List<Attendance> findByEmployeeIdAndDateBetween(
            String employeeId,
            String startDate,
            String endDate
    );
}