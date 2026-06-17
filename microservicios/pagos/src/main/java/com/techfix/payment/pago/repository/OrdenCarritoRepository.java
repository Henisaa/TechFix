package com.techfix.payment.pago.repository;

import com.techfix.payment.pago.model.OrdenCarrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdenCarritoRepository extends JpaRepository<OrdenCarrito, Long> {
    List<OrdenCarrito> findByClienteIdOrderByCreatedAtDesc(Long clienteId);
}
