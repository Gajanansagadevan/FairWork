package com.fairwork.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.fairwork.entity.Shift;
import com.fairwork.service.ShiftService;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {
	
	private ShiftService shiftService;
	
	public ShiftController(ShiftService shiftService) {
		this.shiftService = shiftService;
	}
	
	@GetMapping
	public List<Shift> getAllShifts() {
		return shiftService.getAllShifts();
	}
	
	@PostMapping
	public Shift createShift(@RequestBody Shift shift) {
		return shiftService.saveShift(shift);
	}
	
	@PutMapping("/{id}")
	public Shift updateShift(
			@PathVariable String id,
			@RequestBody Shift shift
			) {
		return shiftService.updateShift(id, shift);
	}
	
	@DeleteMapping("/{id}")
	public void deleteShift(@PathVariable String id) {
		shiftService.deleteShift(id);
	}

}
