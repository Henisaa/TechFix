package com.techfix.stock.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "stock_movements",
    indexes = {
        @Index(name = "ix_movements_product",  columnList = "product_id"),
        @Index(name = "ix_movements_type",     columnList = "movement_type"),
        @Index(name = "ix_movements_created",  columnList = "created_at")
    }
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MovementType movementType;

    /** Positive = stock entry, Negative = stock exit */
    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer quantityBefore;

    @Column(nullable = false)
    private Integer quantityAfter;

    /** Unit cost at the time of the movement (optional) */
    @Column(precision = 12, scale = 2)
    private BigDecimal unitCost;

    /** PO number, invoice reference, etc. */
    @Column(length = 200)
    private String reference;

    @Column(columnDefinition = "TEXT")
    private String notes;

    /** Operator or system that triggered the movement */
    @Column(length = 100)
    private String createdBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
