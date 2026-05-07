package com.techfix.agenda.dto;

import com.techfix.agenda.model.EstadoCita;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EstadoUpdateRequest {

    @NotNull(message = "El estado es obligatorio")
    private EstadoCita estado;
}
