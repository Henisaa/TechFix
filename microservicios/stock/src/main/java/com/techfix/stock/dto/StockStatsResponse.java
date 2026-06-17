package com.techfix.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class StockStatsResponse {
    private long totalProducts;
    private long activeProducts;
    private long outOfStockProducts;
    private long lowStockProducts;
    private BigDecimal totalInventoryCostValue;
    private BigDecimal totalInventoryRetailValue;
}
