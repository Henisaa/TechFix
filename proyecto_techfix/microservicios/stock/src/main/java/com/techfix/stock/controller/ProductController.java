package com.techfix.stock.controller;

import com.techfix.stock.dto.*;
import com.techfix.stock.model.ProductStatus;
import com.techfix.stock.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ── Product CRUD ──────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(productService.findAll(PageRequest.of(page, size, sort)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductResponse> getBySku(@PathVariable String sku) {
        return ResponseEntity.ok(productService.findBySku(sku));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.search(q, PageRequest.of(page, size)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<ProductResponse>> getByStatus(
            @PathVariable ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.findByStatus(status, PageRequest.of(page, size)));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<ProductResponse>> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.findByCategory(categoryId, PageRequest.of(page, size)));
    }


    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(productService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Stock operations ──────────────────────────────────────

    @PostMapping("/movements")
    public ResponseEntity<StockMovementResponse> registerMovement(
            @Valid @RequestBody StockMovementRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.registerMovement(req));
    }

    @PatchMapping("/{id}/adjust-stock")
    public ResponseEntity<StockMovementResponse> adjustStock(
            @PathVariable Long id, @Valid @RequestBody StockAdjustmentRequest req) {
        return ResponseEntity.ok(productService.adjustStock(id, req));
    }

    @GetMapping("/{id}/movements")
    public ResponseEntity<Page<StockMovementResponse>> getMovements(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.getMovements(id,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    // ── Alerts & Stats ────────────────────────────────────────

    @GetMapping("/alerts/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStock() {
        return ResponseEntity.ok(productService.findLowStock());
    }

    @GetMapping("/alerts/out-of-stock")
    public ResponseEntity<List<ProductResponse>> getOutOfStock() {
        return ResponseEntity.ok(productService.findOutOfStock());
    }

    @GetMapping("/stats")
    public ResponseEntity<StockStatsResponse> getStats() {
        return ResponseEntity.ok(productService.getStats());
    }
}
