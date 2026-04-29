package com.techfix.payment;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(
    info = @Info(
        title       = "TechFix - Payment Microservice API",
        version     = "1.0",
        description = "Gestión de pagos y facturación de TechFix",
        contact     = @Contact(
            name  = "TechFix Admin",
            email = "admin@techfix.cl"
        )
    ),
    servers = {
        @Server(url = "http://localhost:8081", description = "Local"),
        @Server(url = "http://payment-service:8081", description = "Docker")
    }
)
public class PaymentApplication {
    public static void main(String[] args) {
        SpringApplication.run(PaymentApplication.class, args);
    }
}
