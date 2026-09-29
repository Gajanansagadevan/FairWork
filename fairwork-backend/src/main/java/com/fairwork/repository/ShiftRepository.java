package com.fairwork.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fairwork.entity.Shift;

public interface ShiftRepository
        extends JpaRepository<Shift, String> {
}
