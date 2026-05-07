package com.userrol.modification;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(
    info = @Info(
        title       = "TechFix - User Microservice API",
        version     = "1.1",
        description = "Gestión de usuarios Techfix",
        contact     = @Contact(
            name  = "TechFix Admin",
            email = "admin@techfix.cl"
        )
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Local"),
        @Server(url = "http://user-service:8080", description = "Docker")
    }
)
public class ModificationApplication {
    public static void main(String[] args) {
        SpringApplication.run(ModificationApplication.class, args);
    }
}