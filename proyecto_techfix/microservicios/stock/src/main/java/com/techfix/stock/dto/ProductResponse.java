package com.techfix.stock.dto;

import com.techfix.stock.model.ProductStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Full product view returned by GET endpoints */
@Data
public class ProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private String brand;
    private String model;
    private BigDecimal costPrice;
    private BigDecimal salePrice;
    private Integer quantityInStock;
    private Integer minStockLevel;
    private Integer maxStockLevel;
    private ProductStatus status;
    private boolean lowStock;
    private boolean outOfStock;
    private Long categoryId;
    private String categoryName;
    private String barcode;
    private String location;
    private String imageUrl;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
