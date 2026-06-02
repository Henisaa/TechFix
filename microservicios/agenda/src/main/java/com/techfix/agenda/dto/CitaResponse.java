package com.techfix.agenda.dto;

import com.techfix.agenda.model.EstadoCita;
import com.techfix.agenda.model.TipoServicio;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CitaResponse {

    private Long id;
    private String numeroOrden;
    private LocalDateTime fechaHora;
    private TipoServicio tipoServicio;
    private EstadoCita estado;
    private String descripcion;
    private ClienteResponse cliente;
    private TecnicoResponse tecnico;
    private BigDecimal precioCotizado;
    private String estadoPagoTicket;
    private String descripcionRealizado;
    private String metodoPago;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
