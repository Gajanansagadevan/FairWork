package com.fairwork.controller;

import org.springframework.http.HttpStatus;
import com.fairwork.exception.ConflictException;
import com.fairwork.exception.BadRequestException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<String> handleBadRequestException(
	        BadRequestException exception
	) {
	    return ResponseEntity
	            .status(HttpStatus.BAD_REQUEST)
	            .body(exception.getMessage());
	}
	
	@ExceptionHandler(ConflictException.class)
	public ResponseEntity<String> handleConflictException(
	        ConflictException exception
	) {
	    return ResponseEntity
	            .status(HttpStatus.CONFLICT)
	            .body(exception.getMessage());
	}

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(
            RuntimeException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(exception.getMessage());
    }
}