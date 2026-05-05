package com.techfix.agenda.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TecnicoResponse {

    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String especialidad;
    private Boolean activo;
    private LocalDateTime createdAt;
}
