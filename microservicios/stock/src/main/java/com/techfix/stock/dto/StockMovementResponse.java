package com.techfix.stock.dto;

import com.techfix.stock.model.MovementType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StockMovementResponse {
    private Long id;
    private Long productId;
    private String productSku;
    private String productName;
    private MovementType movementType;
    private Integer quantity;
    private Integer quantityBefore;
    private Integer quantityAfter;
    private BigDecimal unitCost;
    private String reference;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
}
