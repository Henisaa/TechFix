package com.techfix.payment;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("Requiere base de datos PostgreSQL activa (Docker). Tests unitarios están en pago/service/")
@SpringBootTest
class PaymentApplicationTests {

    @Test
    void contextLoads() {
    }
}
