package com.techfix.stock.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Direct stock quantity adjustment (sets an absolute value) */
@Data
public class StockAdjustmentRequest {

    @NotNull(message = "New quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer newQuantity;

    @NotNull(message = "Reason is required")
    @Size(min = 1, max = 200, message = "Reason must be between 1 and 200 characters")
    private String reason;

    @Size(max = 100)
    private String createdBy;
}
