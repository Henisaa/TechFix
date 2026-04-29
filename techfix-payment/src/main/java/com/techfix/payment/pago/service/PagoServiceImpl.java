package com.techfix.payment.pago.service;

import com.techfix.payment.pago.exception.ConflictException;
import com.techfix.payment.pago.exception.ResourceNotFoundException;
import com.techfix.payment.pago.model.EstadoPago;
import com.techfix.payment.pago.model.Pago;
import com.techfix.payment.pago.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;

  
    @Override
    public Pago crearPago(Long idVisitaTecnica, Pago pago) {
        log.info("Iniciando registro de pago para visita técnica id={}", idVisitaTecnica);

        if (pagoRepository.existsByIdVisitaTecnica(idVisitaTecnica)) {
            throw new ConflictException(
                "Ya existe un pago registrado para la visita técnica con id: " + idVisitaTecnica
            );
        }

        pago.setIdVisitaTecnica(idVisitaTecnica);
        pago.setEstadoPago(EstadoPago.PENDIENTE);
        pago.setFechaPago(LocalDate.now());

        Pago guardado = pagoRepository.save(pago);
        log.info("Pago creado exitosamente con id={}", guardado.getId());
        return guardado;
    }

    @Override
    @Transactional(readOnly = true)
    public Pago verPago(Long id) {
        log.info("Consultando datos de facturación del pago id={}", id);
        return pagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "No se encontró un pago con id: " + id
                ));
    }


    @Override
    public Pago alterarPago(Long id, Pago pagoDetalles) {
        log.info("Alterando pago id={}", id);
        Pago pago = verPago(id);

        if (pago.getEstadoPago() == EstadoPago.ANULADO) {
            throw new ConflictException(
                "El pago con id " + id + " está ANULADO y no puede ser modificado."
            );
        }

        if (pagoDetalles.getMonto() != null)       pago.setMonto(pagoDetalles.getMonto());
        if (pagoDetalles.getMetodoPago() != null)  pago.setMetodoPago(pagoDetalles.getMetodoPago());
        if (pagoDetalles.getEstadoPago() != null)  pago.setEstadoPago(pagoDetalles.getEstadoPago());
        if (pagoDetalles.getDescripcion() != null) pago.setDescripcion(pagoDetalles.getDescripcion());

        Pago actualizado = pagoRepository.save(pago);
        log.info("Pago id={} actualizado. Estado actual: {}", id, actualizado.getEstadoPago());
        return actualizado;
    }
}
