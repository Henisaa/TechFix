package com.techfix.stock.service;

import com.techfix.stock.dto.CategoryRequest;
import com.techfix.stock.dto.CategoryResponse;
import com.techfix.stock.exception.ConflictException;
import com.techfix.stock.exception.ResourceNotFoundException;
import com.techfix.stock.model.Category;
import com.techfix.stock.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        if (categoryRepository.existsByNameIgnoreCase(req.getName())) {
            throw new ConflictException("Category already exists: " + req.getName());
        }
        Category saved = categoryRepository.save(
                Category.builder()
                        .name(req.getName().trim())
                        .description(req.getDescription())
                        .build()
        );
        return toResponse(saved);
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category cat = getOrThrow(id);
        if (!cat.getName().equalsIgnoreCase(req.getName())
                && categoryRepository.existsByNameIgnoreCase(req.getName())) {
            throw new ConflictException("Category name already taken: " + req.getName());
        }
        cat.setName(req.getName().trim());
        cat.setDescription(req.getDescription());
        return toResponse(categoryRepository.save(cat));
    }

    @Transactional
    public void delete(Long id) {
        Category cat = getOrThrow(id);
        cat.setActive(false);
        categoryRepository.save(cat);
    }

    // ── Helpers ──────────────────────────────────────────────
    public Category getOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    private CategoryResponse toResponse(Category cat) {
        CategoryResponse r = new CategoryResponse();
        r.setId(cat.getId());
        r.setName(cat.getName());
        r.setDescription(cat.getDescription());
        r.setActive(cat.isActive());
        r.setCreatedAt(cat.getCreatedAt());
        r.setUpdatedAt(cat.getUpdatedAt());
        return r;
    }
}
