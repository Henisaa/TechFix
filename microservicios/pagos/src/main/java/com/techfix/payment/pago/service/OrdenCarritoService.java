package com.techfix.payment.pago.service;

import com.techfix.payment.pago.model.ItemOrdenCarrito;
import com.techfix.payment.pago.model.OrdenCarrito;
import com.techfix.payment.pago.repository.OrdenCarritoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrdenCarritoService {

    private final OrdenCarritoRepository ordenCarritoRepository;

    @Transactional
    public OrdenCarrito crearOrden(
            Long clienteId,
            String clienteUsername,
            String metodoPago,
            String referenciaExterna,
            List<Map<String, Object>> items) {

        OrdenCarrito orden = OrdenCarrito.builder()
                .clienteId(clienteId)
                .clienteUsername(clienteUsername)
                .metodoPago(metodoPago)
                .referenciaExterna(referenciaExterna)
                .estadoOrden("PAGADO")
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (Map<String, Object> itemData : items) {
            Long productoId = itemData.get("productoId") != null
                    ? Long.valueOf(itemData.get("productoId").toString()) : null;
            String sku = (String) itemData.get("sku");
            String nombre = (String) itemData.get("nombre");
            Integer cantidad = Integer.valueOf(itemData.get("cantidad").toString());
            BigDecimal precioUnitario = new BigDecimal(itemData.get("precioUnitario").toString());
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));

            ItemOrdenCarrito item = ItemOrdenCarrito.builder()
                    .orden(orden)
                    .productoId(productoId)
                    .sku(sku)
                    .nombreProducto(nombre)
                    .cantidad(cantidad)
                    .precioUnitario(precioUnitario)
                    .subtotal(subtotal)
                    .build();

            orden.getItems().add(item);
            total = total.add(subtotal);
        }

        orden.setMontoTotal(total);
        OrdenCarrito guardada = ordenCarritoRepository.save(orden);
        log.info("Orden de carrito creada: id={} clienteId={} total={}", guardada.getId(), clienteId, total);
        return guardada;
    }

    @Transactional(readOnly = true)
    public OrdenCarrito verOrden(Long id) {
        return ordenCarritoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Orden de carrito #" + id + " no encontrada"));
    }

    @Transactional(readOnly = true)
    public List<OrdenCarrito> verOrdenesPorCliente(Long clienteId) {
        return ordenCarritoRepository.findByClienteIdOrderByCreatedAtDesc(clienteId);
    }
}
