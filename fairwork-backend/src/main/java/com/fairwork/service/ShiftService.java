package com.fairwork.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fairwork.entity.Shift;
import com.fairwork.repository.ShiftRepository;

@Service
public class ShiftService {
	
	private final ShiftRepository shiftRepository;
	
	public ShiftService(ShiftRepository shiftRepository) {
		this.shiftRepository = shiftRepository;
	}
	
	public List<Shift> getAllShifts() {
        return shiftRepository.findAll();
    }

    public Shift saveShift(Shift shift) {
        return shiftRepository.save(shift);
    }

    public Shift updateShift(String id, Shift shift) {
        shift.setId(id);
        return shiftRepository.save(shift);
    }

    public void deleteShift(String id) {
        shiftRepository.deleteById(id);
    }

}
