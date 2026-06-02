package com.techfix.agenda.controller;

import com.techfix.agenda.dto.CitaRequest;
import com.techfix.agenda.dto.CitaResponse;
import com.techfix.agenda.dto.EstadoUpdateRequest;
import com.techfix.agenda.dto.GestionServicioRequest;
import com.techfix.agenda.dto.PrecioTicketRequest;
import com.techfix.agenda.dto.CancelarCitaClienteRequest;
import com.techfix.agenda.model.EstadoCita;
import com.techfix.agenda.service.CitaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/citas")
@RequiredArgsConstructor
public class CitaController {

    private final CitaService citaService;

    @GetMapping
    public ResponseEntity<List<CitaResponse>> getAll() {
        return ResponseEntity.ok(citaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CitaResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.findById(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<CitaResponse>> getByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(citaService.findByCliente(clienteId));
    }

    @GetMapping("/tecnico/{tecnicoId}")
    public ResponseEntity<List<CitaResponse>> getByTecnico(@PathVariable Long tecnicoId) {
        return ResponseEntity.ok(citaService.findByTecnico(tecnicoId));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<CitaResponse>> getByEstado(@PathVariable EstadoCita estado) {
        return ResponseEntity.ok(citaService.findByEstado(estado));
    }

    @PostMapping
    public ResponseEntity<CitaResponse> create(@Valid @RequestBody CitaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.create(request));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<CitaResponse> updateEstado(
            @PathVariable Long id,
            @Valid @RequestBody EstadoUpdateRequest request) {
        return ResponseEntity.ok(citaService.updateEstado(id, request));
    }

    @PatchMapping("/{id}/precio")
    public ResponseEntity<CitaResponse> asignarPrecio(
            @PathVariable Long id,
            @Valid @RequestBody PrecioTicketRequest request) {
        return ResponseEntity.ok(citaService.asignarPrecio(id, request));
    }

    @PatchMapping("/{id}/marcar-pagado")
    public ResponseEntity<CitaResponse> marcarPagado(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.marcarPagado(id));
    }

    @PatchMapping("/{id}/gestionar")
    public ResponseEntity<CitaResponse> gestionarServicio(
            @PathVariable Long id,
            @Valid @RequestBody GestionServicioRequest request) {
        return ResponseEntity.ok(citaService.gestionarServicio(id, request));
    }

    @PatchMapping("/{id}/cancelar-cliente")
    public ResponseEntity<CitaResponse> cancelarCliente(
            @PathVariable Long id,
            @Valid @RequestBody CancelarCitaClienteRequest request) {
        return ResponseEntity.ok(citaService.cancelarCliente(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        citaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
