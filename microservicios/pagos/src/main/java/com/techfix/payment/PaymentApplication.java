package com.techfix.payment;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@OpenAPIDefinition(
    info = @Info(
        title       = "TechFix - Payment Microservice API",
        version     = "1.0",
        description = "Gestión de pagos y facturación de TechFix. "
                    + "Implementa idempotencia con UUID v4 para prevenir cobros dobles.",
        contact     = @Contact(
            name  = "TechFix Admin",
            email = "admin@techfix.cl"
        )
    ),
    servers = {
        @Server(url = "http://localhost:8081", description = "Local (directo)"),
        @Server(url = "http://localhost:8090/gateway/pagos", description = "Via API Gateway"),
        @Server(url = "http://svc_pagos:8081", description = "Docker interno")
    }
)
public class PaymentApplication {
    public static void main(String[] args) {
        SpringApplication.run(PaymentApplication.class, args);
    }
}

