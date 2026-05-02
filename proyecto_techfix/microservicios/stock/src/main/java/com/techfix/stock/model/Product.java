package com.techfix.stock.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "products",
    indexes = {
        @Index(name = "ix_products_sku",      columnList = "sku"),
        @Index(name = "ix_products_status",   columnList = "status"),
        @Index(name = "ix_products_category", columnList = "category_id")
    }
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Identity ──────────────────────────────────────────────
    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String brand;

    @Column(length = 100)
    private String model;

    // ── Pricing ───────────────────────────────────────────────
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal salePrice = BigDecimal.ZERO;

    // ── Stock ─────────────────────────────────────────────────
    @Column(nullable = false)
    @Builder.Default
    private Integer quantityInStock = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer minStockLevel = 5;

    @Column
    private Integer maxStockLevel;

    // ── Classification ────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;



    // ── Logistics ─────────────────────────────────────────────
    @Column(unique = true, length = 100)
    private String barcode;

    /** Shelf / bin location inside the warehouse */
    @Column(length = 100)
    private String location;

    @Column(length = 500)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // ── Audit ─────────────────────────────────────────────────
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // ── Relationships ─────────────────────────────────────────
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<StockMovement> movements = new ArrayList<>();

    // ── Derived helpers (not persisted) ───────────────────────
    @Transient
    public boolean isLowStock() {
        return quantityInStock != null && minStockLevel != null
               && quantityInStock <= minStockLevel;
    }

    @Transient
    public boolean isOutOfStock() {
        return quantityInStock != null && quantityInStock == 0;
    }
}
