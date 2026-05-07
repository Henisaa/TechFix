package com.techfix.payment.pago.idempotency;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techfix.payment.pago.model.Pago;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Slf4j
public class IdempotencyService {

    private final IdempotencyKeyRepository repository;
    private final ObjectMapper objectMapper;

    
    @Transactional(readOnly = true)
    public Optional<IdempotencyKey> findKey(String key) {
        return repository.findById(key);
    }

    
    public Pago deserializePago(String json) {
        try {
            return objectMapper.readValue(json, Pago.class);
        } catch (JsonProcessingException e) {
            log.error("Error deserializando pago cacheado: {}", e.getMessage());
            return null;
        }
    }

    
    @Transactional
    public void saveKey(String key, Pago pago, int statusCode) {
        try {
            String body = objectMapper.writeValueAsString(pago);
            IdempotencyKey record = IdempotencyKey.builder()
                    .key(key)
                    .pagoId(pago.getId())
                    .responseBody(body)
                    .statusCode(statusCode)
                    .build();
            repository.save(record);
            log.info("Idempotency key guardada: key={} pagoId={}", key, pago.getId());
        } catch (JsonProcessingException e) {
            log.error("Error serializando pago para idempotency key: {}", e.getMessage());
        }
    }

    
    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void cleanExpiredKeys() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        repository.deleteOlderThan(cutoff);
        log.debug("Limpieza de idempotency keys: eliminadas las anteriores a {}", cutoff);
    }
}
