package com.techfix.stock.controller;

import com.techfix.stock.dto.CategoryRequest;
import com.techfix.stock.dto.CategoryResponse;
import com.techfix.stock.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(categoryService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
