package com.techfix.payment.pago.controller;

import com.techfix.payment.pago.model.Pago;
import com.techfix.payment.pago.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pago")
@RequiredArgsConstructor
@Tag(name = "Pago", description = "Gestión de pagos y facturación de TechFix")
public class PagoController {

    private final PagoService pagoService;

    @PostMapping("/nuevo/{id}")
    @Operation(
        summary     = "Iniciar nuevo registro de pago",
        description = "Crea un pago vinculado al id de la visita técnica. El estado inicial es PENDIENTE."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Pago creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos de pago inválidos"),
        @ApiResponse(responseCode = "409", description = "Ya existe un pago para esta visita técnica")
    })
    public ResponseEntity<Pago> nuevoPago(
            @PathVariable Long id,
            @Valid @RequestBody Pago pago) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(pagoService.crearPago(id, pago));
    }


    @GetMapping("/ver/{id}")
    @Operation(
        summary     = "Ver datos de facturación",
        description = "Rescata los datos de facturación completos del pago identificado por su id."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Datos de pago encontrados"),
        @ApiResponse(responseCode = "404", description = "Pago no encontrado")
    })
    public ResponseEntity<Pago> verPago(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.verPago(id));
    }

    @PutMapping("/alterar/{id}")
    @Operation(
        summary     = "Alterar valores del pago",
        description = "Actualiza los datos del pago por su id. No se puede modificar un pago ANULADO."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Pago actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Pago no encontrado"),
        @ApiResponse(responseCode = "409", description = "El pago está ANULADO y no puede modificarse")
    })
    public ResponseEntity<Pago> alterarPago(
            @PathVariable Long id,
            @RequestBody Pago pagoDetalles) {
        return ResponseEntity.ok(pagoService.alterarPago(id, pagoDetalles));
    }
}
