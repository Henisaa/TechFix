package com.techfix.payment.pago.service;

import com.techfix.payment.pago.exception.ConflictException;
import com.techfix.payment.pago.exception.ResourceNotFoundException;
import com.techfix.payment.pago.model.EstadoPago;
import com.techfix.payment.pago.model.MetodoPago;
import com.techfix.payment.pago.model.Pago;
import com.techfix.payment.pago.repository.PagoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PagoServiceImpl — Unit Tests")
class PagoServiceImplTest {

    @Mock
    private PagoRepository pagoRepository;

    @InjectMocks
    private PagoServiceImpl pagoService;

    // crearPago

    @Test
    @DisplayName("crearPago: ya existe pago PENDIENTE/PAGADO para la cita → ConflictException")
    void crearPago_pagoActivoExistente_lanzaConflict() {
        when(pagoRepository.existsByIdVisitaTecnicaAndEstadoPagoIn(1L,
                List.of(EstadoPago.PENDIENTE, EstadoPago.PAGADO))).thenReturn(true);

        Pago pago = buildPago(MetodoPago.EFECTIVO, "REC-001");

        assertThatThrownBy(() -> pagoService.crearPago(1L, pago, "admin"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("pago activo");
    }

    @Test
    @DisplayName("crearPago: método TRANSFERENCIA sin referenciaExterna → ConflictException")
    void crearPago_transferenciasSinReferencia_lanzaConflict() {
        when(pagoRepository.existsByIdVisitaTecnicaAndEstadoPagoIn(any(), any())).thenReturn(false);
        Pago pago = buildPago(MetodoPago.TRANSFERENCIA, null);

        assertThatThrownBy(() -> pagoService.crearPago(1L, pago, "admin"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("número de operación bancaria");
    }

    @Test
    @DisplayName("crearPago: método TARJETA_CREDITO sin referenciaExterna → ConflictException")
    void crearPago_tarjetaCredSinReferencia_lanzaConflict() {
        when(pagoRepository.existsByIdVisitaTecnicaAndEstadoPagoIn(any(), any())).thenReturn(false);
        Pago pago = buildPago(MetodoPago.TARJETA_CREDITO, "");

        assertThatThrownBy(() -> pagoService.crearPago(1L, pago, "admin"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("código de autorización");
    }

    @Test
    @DisplayName("crearPago: método EFECTIVO sin referenciaExterna → genera referencia automática")
    void crearPago_efectivoSinReferencia_generaReferenciaAuto() {
        when(pagoRepository.existsByIdVisitaTecnicaAndEstadoPagoIn(any(), any())).thenReturn(false);
        when(pagoRepository.save(any(Pago.class))).thenAnswer(inv -> inv.getArgument(0));

        Pago pago = buildPago(MetodoPago.EFECTIVO, null);

        Pago result = pagoService.crearPago(1L, pago, "admin");

        assertThat(result.getReferenciaExterna()).startsWith("REC-");
        assertThat(result.getEstadoPago()).isEqualTo(EstadoPago.PENDIENTE);
    }

    @Test
    @DisplayName("crearPago: EFECTIVO con referencia provista → guarda en estado PENDIENTE")
    void crearPago_efectivoConReferencia_guardaPendiente() {
        when(pagoRepository.existsByIdVisitaTecnicaAndEstadoPagoIn(any(), any())).thenReturn(false);
        when(pagoRepository.save(any(Pago.class))).thenAnswer(inv -> inv.getArgument(0));

        Pago pago = buildPago(MetodoPago.EFECTIVO, "REC-123");

        Pago result = pagoService.crearPago(1L, pago, "operador");

        assertThat(result.getEstadoPago()).isEqualTo(EstadoPago.PENDIENTE);
        assertThat(result.getCreatedBy()).isEqualTo("operador");
        assertThat(result.getIdVisitaTecnica()).isEqualTo(1L);
    }

    // verPago

    @Test
    @DisplayName("verPago: ID inexistente → ResourceNotFoundException")
    void verPago_idNoExiste_lanzaNotFound() {
        when(pagoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pagoService.verPago(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("verPago: ID existente → devuelve el pago")
    void verPago_idExistente_devuelvePago() {
        Pago pago = buildPago(MetodoPago.EFECTIVO, "REC-001");
        pago.setId(5L);
        when(pagoRepository.findById(5L)).thenReturn(Optional.of(pago));

        Pago result = pagoService.verPago(5L);

        assertThat(result.getId()).isEqualTo(5L);
    }

    // alterarPago

    @Test
    @DisplayName("alterarPago: pago ANULADO → ConflictException")
    void alterarPago_estadoAnulado_lanzaConflict() {
        Pago pago = buildPago(MetodoPago.EFECTIVO, "REC-001");
        pago.setId(1L);
        pago.setEstadoPago(EstadoPago.ANULADO);
        when(pagoRepository.findById(1L)).thenReturn(Optional.of(pago));

        assertThatThrownBy(() -> pagoService.alterarPago(1L, new Pago(), "admin"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("ANULADO");
    }

    @Test
    @DisplayName("alterarPago: pago PAGADO → ConflictException")
    void alterarPago_estadoPagado_lanzaConflict() {
        Pago pago = buildPago(MetodoPago.EFECTIVO, "REC-001");
        pago.setId(1L);
        pago.setEstadoPago(EstadoPago.PAGADO);
        when(pagoRepository.findById(1L)).thenReturn(Optional.of(pago));

        assertThatThrownBy(() -> pagoService.alterarPago(1L, new Pago(), "admin"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("PAGADO");
    }

    @Test
    @DisplayName("alterarPago: cambio a ANULADO sin razón → ConflictException")
    void alterarPago_anularSinRazon_lanzaConflict() {
        Pago pagoExistente = buildPago(MetodoPago.EFECTIVO, "REC-001");
        pagoExistente.setId(1L);
        pagoExistente.setEstadoPago(EstadoPago.PENDIENTE);
        when(pagoRepository.findById(1L)).thenReturn(Optional.of(pagoExistente));

        Pago cambio = new Pago();
        cambio.setEstadoPago(EstadoPago.ANULADO);
        cambio.setRazonAnulacion(null);

        assertThatThrownBy(() -> pagoService.alterarPago(1L, cambio, "admin"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("razón de anulación");
    }

    @Test
    @DisplayName("alterarPago: cambio a PAGADO → setea confirmedBy")
    void alterarPago_cambioAPagado_seteaConfirmedBy() {
        Pago pagoExistente = buildPago(MetodoPago.EFECTIVO, "REC-001");
        pagoExistente.setId(1L);
        pagoExistente.setEstadoPago(EstadoPago.PENDIENTE);
        when(pagoRepository.findById(1L)).thenReturn(Optional.of(pagoExistente));
        when(pagoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Pago cambio = new Pago();
        cambio.setEstadoPago(EstadoPago.PAGADO);

        Pago result = pagoService.alterarPago(1L, cambio, "cajero");

        assertThat(result.getEstadoPago()).isEqualTo(EstadoPago.PAGADO);
        assertThat(result.getConfirmedBy()).isEqualTo("cajero");
    }

    // Helper

    private Pago buildPago(MetodoPago metodo, String referencia) {
        return Pago.builder()
                .monto(BigDecimal.valueOf(15000))
                .metodoPago(metodo)
                .referenciaExterna(referencia)
                .estadoPago(EstadoPago.PENDIENTE)
                .build();
    }
}
