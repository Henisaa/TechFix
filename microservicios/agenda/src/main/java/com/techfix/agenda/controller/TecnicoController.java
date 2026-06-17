package com.techfix.agenda.controller;

import com.techfix.agenda.dto.TecnicoRequest;
import com.techfix.agenda.dto.TecnicoResponse;
import com.techfix.agenda.service.TecnicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tecnicos")
@RequiredArgsConstructor
public class TecnicoController {

    private final TecnicoService tecnicoService;

    @GetMapping
    public ResponseEntity<List<TecnicoResponse>> getAll() {
        return ResponseEntity.ok(tecnicoService.findAll());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<TecnicoResponse>> getActivos() {
        return ResponseEntity.ok(tecnicoService.findActivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TecnicoResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tecnicoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<TecnicoResponse> create(@Valid @RequestBody TecnicoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tecnicoService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TecnicoResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TecnicoRequest request) {
        return ResponseEntity.ok(tecnicoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tecnicoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
