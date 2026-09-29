package com.fairwork.service;

import java.util.List;
import java.util.UUID;
import com.fairwork.exception.ConflictException;

import org.springframework.stereotype.Service;

import com.fairwork.entity.Attendance;
import com.fairwork.repository.AttendanceRepository;

@Service
public class AttendanceService {
	
	private final AttendanceRepository attendanceRepository;
	
	public AttendanceService(
			AttendanceRepository attendanceRepository
			) {
		this.attendanceRepository = attendanceRepository;
	}
	
	public List<Attendance> getAllAttendance() {
		return attendanceRepository.findAll();
	}
	
	public Attendance saveAttendance(Attendance attendance) {

	    boolean alreadyExists =
	            attendanceRepository.existsByEmployeeIdAndDate(
	                    attendance.getEmployeeId(),
	                    attendance.getDate()
	            );

	    if (alreadyExists) {
	        throw new ConflictException(
	                "Attendance already exists for this employee and date"
	        );
	    }

	    attendance.setId(UUID.randomUUID().toString());

	    return attendanceRepository.save(attendance);
	}
	
	public Attendance updateAttendance(
			String id,
			Attendance attendance
			) {
		attendance.setId(id);
		return attendanceRepository.save(attendance);
	}
	
	public void deleteAttendance(String id) {
		attendanceRepository.deleteById(id);
		
	}
	
	

}
