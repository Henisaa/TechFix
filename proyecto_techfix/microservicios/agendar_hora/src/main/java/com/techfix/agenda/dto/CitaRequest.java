package com.techfix.agenda.dto;

import com.techfix.agenda.model.TipoServicio;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CitaRequest {

    @NotNull(message = "La fecha y hora son obligatorias")
    private LocalDateTime fechaHora;

    @NotNull(message = "El tipo de servicio es obligatorio")
    private TipoServicio tipoServicio;

    private String descripcion;

    @NotNull(message = "El cliente es obligatorio")
    private Long clienteId;

    @NotNull(message = "El técnico es obligatorio")
    private Long tecnicoId;
}
