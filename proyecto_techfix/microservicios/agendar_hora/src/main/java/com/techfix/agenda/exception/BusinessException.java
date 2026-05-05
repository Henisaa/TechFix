package com.techfix.agenda.exception;

/**
 * Thrown when a business rule is violated.
 * Example: technician already has 6 appointments on that day.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
