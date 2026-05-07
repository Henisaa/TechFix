package com.techfix.stock.service;

import com.techfix.stock.dto.*;
import com.techfix.stock.exception.ConflictException;
import com.techfix.stock.exception.InsufficientStockException;
import com.techfix.stock.exception.ResourceNotFoundException;
import com.techfix.stock.model.*;
import com.techfix.stock.repository.ProductRepository;
import com.techfix.stock.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final StockMovementRepository movementRepository;
    private final CategoryService categoryService;

    

    public Page<ProductResponse> findAll(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<ProductResponse> findByStatus(ProductStatus status, Pageable pageable) {
        return productRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    public Page<ProductResponse> findByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable).map(this::toResponse);
    }

    public Page<ProductResponse> search(String query, Pageable pageable) {
        return productRepository.search(query, pageable).map(this::toResponse);
    }

    public ProductResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public ProductResponse findBySku(String sku) {
        return toResponse(productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku)));
    }

    public List<ProductResponse> findLowStock() {
        return productRepository.findLowStockProducts().stream().map(this::toResponse).toList();
    }

    public List<ProductResponse> findOutOfStock() {
        return productRepository.findOutOfStockProducts().stream().map(this::toResponse).toList();
    }

    public StockStatsResponse getStats() {
        long total = productRepository.count();
        long active = productRepository.findByStatus(ProductStatus.ACTIVE, Pageable.unpaged()).getTotalElements();
        long oos = productRepository.findOutOfStockProducts().size();
        long low = productRepository.findLowStockProducts().size();
        return new StockStatsResponse(
                total, active, oos, low,
                productRepository.totalInventoryCostValue(),
                productRepository.totalInventoryRetailValue());
    }

    

    @Transactional
    public ProductResponse create(ProductRequest req) {
        if (productRepository.existsBySku(req.getSku())) {
            throw new ConflictException("SKU already in use: " + req.getSku());
        }
        if (req.getBarcode() != null && productRepository.existsByBarcode(req.getBarcode())) {
            throw new ConflictException("Barcode already in use: " + req.getBarcode());
        }
        Product product = buildFromRequest(new Product(), req);
        product.setQuantityInStock(req.getQuantityInStock());

        Product saved = productRepository.save(product);

        
        if (req.getQuantityInStock() > 0) {
            recordMovement(saved, MovementType.PURCHASE, req.getQuantityInStock(),
                    0, req.getQuantityInStock(), req.getCostPrice(), "INITIAL_STOCK", null);
        }
        return toResponse(saved);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product product = getOrThrow(id);

        
        if (!product.getSku().equals(req.getSku()) && productRepository.existsBySku(req.getSku())) {
            throw new ConflictException("SKU already in use: " + req.getSku());
        }
        
        if (req.getBarcode() != null
                && !req.getBarcode().equals(product.getBarcode())
                && productRepository.existsByBarcode(req.getBarcode())) {
            throw new ConflictException("Barcode already in use: " + req.getBarcode());
        }

        buildFromRequest(product, req);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product p = getOrThrow(id);
        p.setStatus(ProductStatus.INACTIVE);
        productRepository.save(p);
    }

    

    @Transactional
    public StockMovementResponse registerMovement(StockMovementRequest req) {
        if (req.getQuantity() == 0) {
            throw new IllegalArgumentException("Quantity must not be zero");
        }
        Product product = getOrThrow(req.getProductId());
        int before = product.getQuantityInStock();
        int after = before + req.getQuantity();

        if (after < 0) {
            throw new InsufficientStockException(
                    "Insufficient stock: available=" + before + ", requested=" + Math.abs(req.getQuantity()));
        }

        product.setQuantityInStock(after);
        productRepository.save(product);

        StockMovement movement = recordMovement(
                product, req.getMovementType(), req.getQuantity(),
                before, after, req.getUnitCost(), req.getReference(), req.getNotes());
        if (req.getCreatedBy() != null)
            movement.setCreatedBy(req.getCreatedBy());
        movementRepository.save(movement);

        return toMovementResponse(movement);
    }

    @Transactional
    public StockMovementResponse adjustStock(Long productId, StockAdjustmentRequest req) {
        Product product = getOrThrow(productId);
        int before = product.getQuantityInStock();
        int after = req.getNewQuantity();
        int delta = after - before;

        product.setQuantityInStock(after);
        productRepository.save(product);

        StockMovement movement = StockMovement.builder()
                .product(product)
                .movementType(MovementType.ADJUSTMENT)
                .quantity(delta)
                .quantityBefore(before)
                .quantityAfter(after)
                .notes(req.getReason())
                .createdBy(req.getCreatedBy())
                .build();
        movement = movementRepository.save(movement);

        return toMovementResponse(movement);
    }

    public Page<StockMovementResponse> getMovements(Long productId, Pageable pageable) {
        return movementRepository.findByProductId(productId, pageable)
                .map(this::toMovementResponse);
    }

    

    private Product buildFromRequest(Product p, ProductRequest req) {
        p.setSku(req.getSku());
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setBrand(req.getBrand());
        p.setModel(req.getModel());
        p.setCostPrice(req.getCostPrice());
        p.setSalePrice(req.getSalePrice());
        p.setMinStockLevel(req.getMinStockLevel());
        p.setMaxStockLevel(req.getMaxStockLevel());
        p.setStatus(req.getStatus() != null ? req.getStatus() : ProductStatus.ACTIVE);
        p.setBarcode(req.getBarcode());
        p.setLocation(req.getLocation());
        p.setImageUrl(req.getImageUrl());
        p.setNotes(req.getNotes());

        if (req.getCategoryId() != null) {
            p.setCategory(categoryService.getOrThrow(req.getCategoryId()));
        }
        return p;
    }

    private StockMovement recordMovement(
            Product product, MovementType type, int qty, int before, int after,
            java.math.BigDecimal unitCost, String reference, String notes) {

        return movementRepository.save(StockMovement.builder()
                .product(product)
                .movementType(type)
                .quantity(qty)
                .quantityBefore(before)
                .quantityAfter(after)
                .unitCost(unitCost)
                .reference(reference)
                .notes(notes)
                .build());
    }

    private Product getOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    private ProductResponse toResponse(Product p) {
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setSku(p.getSku());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setBrand(p.getBrand());
        r.setModel(p.getModel());
        r.setCostPrice(p.getCostPrice());
        r.setSalePrice(p.getSalePrice());
        r.setQuantityInStock(p.getQuantityInStock());
        r.setMinStockLevel(p.getMinStockLevel());
        r.setMaxStockLevel(p.getMaxStockLevel());
        r.setStatus(p.getStatus());
        r.setLowStock(p.isLowStock());
        r.setOutOfStock(p.isOutOfStock());
        r.setBarcode(p.getBarcode());
        r.setLocation(p.getLocation());
        r.setImageUrl(p.getImageUrl());
        r.setNotes(p.getNotes());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        if (p.getCategory() != null) {
            r.setCategoryId(p.getCategory().getId());
            r.setCategoryName(p.getCategory().getName());
        }
        return r;
    }

    private StockMovementResponse toMovementResponse(StockMovement m) {
        StockMovementResponse r = new StockMovementResponse();
        r.setId(m.getId());
        r.setProductId(m.getProduct().getId());
        r.setProductSku(m.getProduct().getSku());
        r.setProductName(m.getProduct().getName());
        r.setMovementType(m.getMovementType());
        r.setQuantity(m.getQuantity());
        r.setQuantityBefore(m.getQuantityBefore());
        r.setQuantityAfter(m.getQuantityAfter());
        r.setUnitCost(m.getUnitCost());
        r.setReference(m.getReference());
        r.setNotes(m.getNotes());
        r.setCreatedBy(m.getCreatedBy());
        r.setCreatedAt(m.getCreatedAt());
        return r;
    }

}
