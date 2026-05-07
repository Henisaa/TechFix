package com.techfix.stock.repository;

import com.techfix.stock.model.MovementType;
import com.techfix.stock.model.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    Page<StockMovement> findByProductId(Long productId, Pageable pageable);

    Page<StockMovement> findByMovementType(MovementType type, Pageable pageable);

    Page<StockMovement> findByProductIdAndMovementType(Long productId, MovementType type, Pageable pageable);
}
