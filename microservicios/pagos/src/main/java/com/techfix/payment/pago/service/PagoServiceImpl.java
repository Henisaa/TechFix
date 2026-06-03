package com.techfix.payment.pago.service;

import com.techfix.payment.pago.exception.ConflictException;
import com.techfix.payment.pago.exception.ResourceNotFoundException;
import com.techfix.payment.pago.model.EstadoPago;
import com.techfix.payment.pago.model.MetodoPago;
import com.techfix.payment.pago.model.Pago;
import com.techfix.payment.pago.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;

    @Override
    public Pago crearPago(Long idVisitaTecnica, Pago pago, String operatorUsername) {
        log.info("Iniciando registro de pago para visita técnica id={}", idVisitaTecnica);

        if (pagoRepository.existsByIdVisitaTecnicaAndEstadoPagoIn(
                idVisitaTecnica, List.of(EstadoPago.PENDIENTE, EstadoPago.PAGADO))) {
            throw new ConflictException(
                "Ya existe un pago activo (PENDIENTE o PAGADO) para la visita técnica con id: " + idVisitaTecnica
            );
        }

        pago.setIdVisitaTecnica(idVisitaTecnica);
        pago.setEstadoPago(EstadoPago.PENDIENTE);
        pago.setFechaPago(LocalDateTime.now());
        pago.setCreatedBy(operatorUsername != null ? operatorUsername : "system");

        if (pago.getMetodoPago() == MetodoPago.TRANSFERENCIA) {
            if (pago.getReferenciaExterna() == null || pago.getReferenciaExterna().isBlank()) {
                throw new ConflictException("Para pagos por transferencia, el número de operación bancaria es obligatorio.");
            }
        } else if (pago.getMetodoPago() == MetodoPago.TARJETA_DEBITO
                || pago.getMetodoPago() == MetodoPago.TARJETA_CREDITO) {
            if (pago.getReferenciaExterna() == null || pago.getReferenciaExterna().isBlank()) {
                throw new ConflictException("Para pagos con tarjeta, el código de autorización es obligatorio.");
            }
        } else if (pago.getMetodoPago() == MetodoPago.EFECTIVO) {
            if (pago.getReferenciaExterna() == null || pago.getReferenciaExterna().isBlank()) {
                pago.setReferenciaExterna("REC-" + System.currentTimeMillis());
            }
        }

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
    public Pago alterarPago(Long id, Pago pagoDetalles, String operatorUsername) {
        log.info("Alterando pago id={}", id);
        Pago pago = verPago(id);

        if (pago.getEstadoPago() == EstadoPago.ANULADO) {
            throw new ConflictException(
                "El pago con id " + id + " está ANULADO y no puede ser modificado."
            );
        }

        if (pago.getEstadoPago() == EstadoPago.PAGADO) {
            throw new ConflictException(
                "El pago con id " + id + " está PAGADO y no puede ser modificado. Anúlelo y cree uno nuevo para corregirlo."
            );
        }

        if (pagoDetalles.getMonto() != null)       pago.setMonto(pagoDetalles.getMonto());
        if (pagoDetalles.getMetodoPago() != null)  pago.setMetodoPago(pagoDetalles.getMetodoPago());
        if (pagoDetalles.getDescripcion() != null) pago.setDescripcion(pagoDetalles.getDescripcion());

        if (pagoDetalles.getEstadoPago() != null) {
            pago.setEstadoPago(pagoDetalles.getEstadoPago());

            if (pagoDetalles.getEstadoPago() == EstadoPago.PAGADO) {
                pago.setConfirmedBy(operatorUsername);
            }

            if (pagoDetalles.getEstadoPago() == EstadoPago.ANULADO) {
                if (pagoDetalles.getRazonAnulacion() == null || pagoDetalles.getRazonAnulacion().isBlank()) {
                    throw new ConflictException("Para anular un pago, debe indicarse una razón de anulación.");
                }
                pago.setRazonAnulacion(pagoDetalles.getRazonAnulacion());
            }
        }

        Pago actualizado = pagoRepository.save(pago);
        log.info("Pago id={} actualizado. Estado actual: {}", id, actualizado.getEstadoPago());
        return actualizado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Pago> listarTodos() {
        return pagoRepository.findAll();
    }
}
