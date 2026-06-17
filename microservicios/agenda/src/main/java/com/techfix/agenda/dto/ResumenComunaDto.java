package com.techfix.agenda.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumenComunaDto {
    private String comuna;
    private Long total;
    private Long completadas;
    private Long pendientes;
    private Long enProceso;
}
