package com.techfix.agenda.exception;

/**
 * Thrown when a requested resource does not exist in the database.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " con id " + id + " no encontrado.");
    }
}
