package com.techfix.agenda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class GestionServicioRequest {

    @NotNull
    private BigDecimal precio;

    @NotBlank
    private String descripcionRealizado;

    @NotBlank
    private String accion;

    private String metodoPago;

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public String getDescripcionRealizado() { return descripcionRealizado; }
    public void setDescripcionRealizado(String descripcionRealizado) { this.descripcionRealizado = descripcionRealizado; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
}
