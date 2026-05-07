package com.techfix.payment.pago.idempotency;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(name = "idempotency_keys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdempotencyKey {

    
    @Id
    @Column(name = "idempotency_key", length = 36, nullable = false)
    private String key;

    
    @Column(name = "pago_id")
    private Long pagoId;

    
    @Column(name = "response_body", columnDefinition = "TEXT", nullable = false)
    private String responseBody;

    
    @Column(name = "status_code", nullable = false)
    private Integer statusCode;

    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
