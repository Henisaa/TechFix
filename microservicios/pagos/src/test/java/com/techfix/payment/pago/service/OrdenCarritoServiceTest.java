package com.techfix.payment.pago.service;

import com.techfix.payment.pago.model.OrdenCarrito;
import com.techfix.payment.pago.repository.OrdenCarritoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrdenCarritoService — Unit Tests")
class OrdenCarritoServiceTest {

    @Mock
    private OrdenCarritoRepository ordenCarritoRepository;

    @InjectMocks
    private OrdenCarritoService ordenCarritoService;

    // crearOrden

    @Test
    @DisplayName("crearOrden: calcula total correctamente y guarda con estado PAGADO")
    void crearOrden_itemsValidos_calculaTotalYGuarda() {
        when(ordenCarritoRepository.save(any(OrdenCarrito.class)))
                .thenAnswer(inv -> {
                    OrdenCarrito o = inv.getArgument(0);
                    o.setId(10L);
                    return o;
                });

    // 2 productos: 3 × $5000 + 1 × $20000 = $35000
        List<Map<String, Object>> items = List.of(
                Map.of("productoId", 1L, "sku", "BAT-001", "nombre", "Batería",
                        "cantidad", 3, "precioUnitario", "5000"),
                Map.of("productoId", 2L, "sku", "PANT-001", "nombre", "Pantalla",
                        "cantidad", 1, "precioUnitario", "20000")
        );

        OrdenCarrito result = ordenCarritoService.crearOrden(
                42L, "cliente1", "EFECTIVO", null, items);

        assertThat(result.getMontoTotal()).isEqualByComparingTo(BigDecimal.valueOf(35000));
        assertThat(result.getEstadoOrden()).isEqualTo("PAGADO");
        assertThat(result.getClienteId()).isEqualTo(42L);
        assertThat(result.getItems()).hasSize(2);
    }

    // verOrden

    @Test
    @DisplayName("verOrden: ID inexistente → NoSuchElementException")
    void verOrden_idNoExiste_lanzaNoSuchElement() {
        when(ordenCarritoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ordenCarritoService.verOrden(999L))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("verOrden: ID existente → devuelve la orden")
    void verOrden_idExistente_devuelveOrden() {
        OrdenCarrito orden = new OrdenCarrito();
        orden.setId(7L);
        when(ordenCarritoRepository.findById(7L)).thenReturn(Optional.of(orden));

        OrdenCarrito result = ordenCarritoService.verOrden(7L);

        assertThat(result.getId()).isEqualTo(7L);
    }

    // verOrdenesPorCliente

    @Test
    @DisplayName("verOrdenesPorCliente: delega correctamente al repositorio")
    void verOrdenesPorCliente_delegaAlRepositorio() {
        OrdenCarrito o1 = new OrdenCarrito();
        OrdenCarrito o2 = new OrdenCarrito();
        when(ordenCarritoRepository.findByClienteIdOrderByCreatedAtDesc(5L))
                .thenReturn(List.of(o1, o2));

        List<OrdenCarrito> result = ordenCarritoService.verOrdenesPorCliente(5L);

        assertThat(result).hasSize(2);
        verify(ordenCarritoRepository).findByClienteIdOrderByCreatedAtDesc(5L);
    }
}
