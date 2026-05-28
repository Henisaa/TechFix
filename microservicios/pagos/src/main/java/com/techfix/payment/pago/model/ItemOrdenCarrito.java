package com.techfix.payment.pago.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "item_orden_carrito")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemOrdenCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id", nullable = false)
    @JsonIgnore
    private OrdenCarrito orden;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @Column(name = "sku", length = 100)
    private String sku;

    @Column(name = "nombre_producto", nullable = false, length = 255)
    private String nombreProducto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
}
