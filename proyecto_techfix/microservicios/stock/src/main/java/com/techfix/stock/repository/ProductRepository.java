package com.techfix.stock.repository;

import com.techfix.stock.model.Product;
import com.techfix.stock.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);
    Optional<Product> findByBarcode(String barcode);

    boolean existsBySku(String sku);
    boolean existsByBarcode(String barcode);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    /** Full-text search across name, SKU, brand, model */
    @Query("""
        SELECT p FROM Product p
        WHERE LOWER(p.name)  LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.sku)   LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.model) LIKE LOWER(CONCAT('%', :q, '%'))
    """)
    Page<Product> search(@Param("q") String query, Pageable pageable);

    /** Products at or below their minimum stock level */
    @Query("SELECT p FROM Product p WHERE p.quantityInStock <= p.minStockLevel AND p.status = 'ACTIVE'")
    List<Product> findLowStockProducts();

    /** Products with zero units */
    @Query("SELECT p FROM Product p WHERE p.quantityInStock = 0 AND p.status = 'ACTIVE'")
    List<Product> findOutOfStockProducts();

    /** Inventory cost value = SUM(qty * costPrice) */
    @Query("SELECT COALESCE(SUM(p.quantityInStock * p.costPrice), 0) FROM Product p WHERE p.status = 'ACTIVE'")
    java.math.BigDecimal totalInventoryCostValue();

    /** Inventory retail value = SUM(qty * salePrice) */
    @Query("SELECT COALESCE(SUM(p.quantityInStock * p.salePrice), 0) FROM Product p WHERE p.status = 'ACTIVE'")
    java.math.BigDecimal totalInventoryRetailValue();
}
