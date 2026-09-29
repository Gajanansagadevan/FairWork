package com.fairwork.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fairwork.entity.Attendance;
import com.fairwork.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
	
	private final AttendanceService attendanceService;
	
	public AttendanceController(AttendanceService attendanceService) {
		this.attendanceService = attendanceService;
	}
	
	@GetMapping
	public List<Attendance> getAllAttendance() {
		return attendanceService.getAllAttendance();
	}
	
	@PostMapping 
	public Attendance createAttendance(
			@RequestBody Attendance attendance
			) {
		return attendanceService.saveAttendance(attendance);
	}
	
	@PutMapping("/{id}")
	public Attendance updateAttendance(
			@PathVariable String id,
			@RequestBody Attendance attendance
			) {
		return attendanceService.updateAttendance(id,  attendance);
	}
	
	@DeleteMapping("/{id}")
	public void deleteAttendance(@PathVariable String id) {
		attendanceService.deleteAttendance(id);
	}

}

