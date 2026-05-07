package com.techfix.payment.pago.repository;

import com.techfix.payment.pago.model.EstadoPago;
import com.techfix.payment.pago.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByIdVisitaTecnica(Long idVisitaTecnica);
    List<Pago> findByEstadoPago(EstadoPago estadoPago);
    boolean existsByIdVisitaTecnica(Long idVisitaTecnica);
}
