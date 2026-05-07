package com.techfix.payment.pago.controller;

import com.techfix.payment.pago.idempotency.IdempotencyKey;
import com.techfix.payment.pago.idempotency.IdempotencyService;
import com.techfix.payment.pago.model.Pago;
import com.techfix.payment.pago.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/pago")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Pago", description = "Gestión de pagos y facturación de TechFix")
public class PagoController {

    private final PagoService pagoService;
    private final IdempotencyService idempotencyService;

    @PostMapping("/nuevo/{id}")
    @Operation(
        summary = "Iniciar nuevo registro de pago",
        description = "Crea un pago vinculado al id de la visita técnica. "
                    + "Envía el header 'Idempotency-Key' (UUID v4) para evitar cobros dobles. "
                    + "Si el servidor detecta la misma llave, devuelve el pago original sin procesar uno nuevo."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Pago creado exitosamente"),
        @ApiResponse(responseCode = "200", description = "Pago duplicado detectado — se retorna el pago original"),
        @ApiResponse(responseCode = "400", description = "Datos de pago inválidos"),
        @ApiResponse(responseCode = "409", description = "Ya existe un pago para esta visita técnica")
    })
    public ResponseEntity<Pago> nuevoPago(
            @PathVariable Long id,
            @Valid @RequestBody Pago pago,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {

        
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<IdempotencyKey> existing = idempotencyService.findKey(idempotencyKey);

            if (existing.isPresent()) {
                log.warn("Idempotency-Key duplicada detectada: {} → retornando pago #{} sin cobrar de nuevo",
                        idempotencyKey, existing.get().getPagoId());

                Pago cached = idempotencyService.deserializePago(existing.get().getResponseBody());
                if (cached != null) {
                    
                    return ResponseEntity.ok(cached);
                }
            }
        }

        
        Pago creado = pagoService.crearPago(id, pago);
        log.info("Pago creado: id={} visita={}", creado.getId(), id);

        
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            idempotencyService.saveKey(idempotencyKey, creado, HttpStatus.CREATED.value());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @GetMapping("/ver/{id}")
    @Operation(summary = "Ver datos de facturación")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Datos de pago encontrados"),
        @ApiResponse(responseCode = "404", description = "Pago no encontrado")
    })
    public ResponseEntity<Pago> verPago(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.verPago(id));
    }

    @PutMapping("/alterar/{id}")
    @Operation(summary = "Alterar valores del pago")
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
