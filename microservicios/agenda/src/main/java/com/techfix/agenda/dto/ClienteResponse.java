package com.techfix.agenda.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ClienteResponse {

    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private LocalDateTime createdAt;
}
