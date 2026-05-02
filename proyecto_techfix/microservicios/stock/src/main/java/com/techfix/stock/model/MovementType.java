package com.techfix.stock.model;

public enum MovementType {
    PURCHASE,    // Stock entry from supplier
    SALE,        // Stock exit due to a sale
    ADJUSTMENT,  // Manual quantity correction
    RETURN,      // Customer return (increases stock)
    TRANSFER,    // Warehouse location transfer
    DAMAGE       // Write-off for damaged goods
}
