package com.techfix.stock.dto;

import com.techfix.stock.model.MovementType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;


@Data
public class StockMovementRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Movement type is required")
    private MovementType movementType;

    @NotNull(message = "Quantity is required")
    private Integer quantity;  

    private BigDecimal unitCost;

    @Size(max = 200)
    private String reference;

    private String notes;

    @Size(max = 100)
    private String createdBy;
}
