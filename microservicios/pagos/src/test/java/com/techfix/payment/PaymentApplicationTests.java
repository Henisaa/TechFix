package com.techfix.payment;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Deshabilitado: test de integración que requiere PostgreSQL activo (Docker).
// Para ejecutarlo: docker compose up, luego correr esta clase individualmente.
@Disabled("Requiere base de datos PostgreSQL activa (Docker). Tests unitarios están en pago/service/")
@SpringBootTest
class PaymentApplicationTests {

    @Test
    void contextLoads() {
    }
}
