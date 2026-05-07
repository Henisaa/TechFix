package com.techfix.stock.dto;

import com.techfix.stock.model.ProductStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;


@Data
public class ProductRequest {

    @NotBlank(message = "SKU is required")
    @Size(max = 100)
    private String sku;

    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    private String description;

    @Size(max = 100)
    private String brand;

    @Size(max = 100)
    private String model;

    @NotNull(message = "Cost price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Cost price must be >= 0")
    private BigDecimal costPrice;

    @NotNull(message = "Sale price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Sale price must be >= 0")
    private BigDecimal salePrice;

    @Min(value = 0, message = "Initial stock must be >= 0")
    private Integer quantityInStock = 0;

    @Min(value = 0)
    private Integer minStockLevel = 5;

    @Min(value = 0)
    private Integer maxStockLevel;

    private ProductStatus status = ProductStatus.ACTIVE;

    private Long categoryId;

    @Size(max = 100)
    private String barcode;

    @Size(max = 100)
    private String location;

    @Size(max = 500)
    private String imageUrl;

    private String notes;
}
