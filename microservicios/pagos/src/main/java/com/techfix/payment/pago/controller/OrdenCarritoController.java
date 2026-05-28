package com.techfix.payment.pago.controller;

import com.techfix.payment.pago.model.OrdenCarrito;
import com.techfix.payment.pago.service.OrdenCarritoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pago/carrito")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Carrito", description = "Gestión de órdenes de compra del catálogo de repuestos")
public class OrdenCarritoController {

    private final OrdenCarritoService ordenCarritoService;

    @PostMapping("/nuevo")
    @Operation(summary = "Crear orden de carrito y registrar pago")
    public ResponseEntity<OrdenCarrito> crearOrden(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Username", required = false) String username) {

        Long clienteId = body.get("clienteId") != null
                ? Long.valueOf(body.get("clienteId").toString()) : null;
        String metodoPago = (String) body.getOrDefault("metodoPago", "EFECTIVO");
        String referenciaExterna = (String) body.getOrDefault("referenciaExterna", "");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");

        if (items == null || items.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        OrdenCarrito orden = ordenCarritoService.crearOrden(
                clienteId,
                username,
                metodoPago,
                referenciaExterna,
                items
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(orden);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ver detalle de una orden de carrito")
    public ResponseEntity<OrdenCarrito> verOrden(@PathVariable Long id) {
        return ResponseEntity.ok(ordenCarritoService.verOrden(id));
    }

    @GetMapping("/cliente/{clienteId}")
    @Operation(summary = "Ver órdenes de un cliente")
    public ResponseEntity<List<OrdenCarrito>> verOrdenesPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(ordenCarritoService.verOrdenesPorCliente(clienteId));
    }
}
