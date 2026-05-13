package com.techfix.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

        private static final String ROLES = "http://svc-roles:8080";
        private static final String PAGOS = "http://svc-pagos:8081";
        private static final String STOCK = "http://svc-stock:8082";
        private static final String AGENDA = "http://svc-agenda:8083";

        @Bean
        public RouteLocator routes(RouteLocatorBuilder builder) {
                return builder.routes()
                                .route("users-login", r -> r.path("/gateway/users/login").and().method("POST")
                                                .filters(f -> f.rewritePath("/gateway/users/login",
                                                                "/api/v1/users/login"))
                                                .uri(ROLES))
                                .route("users-register", r -> r.path("/gateway/users/register").and().method("POST")
                                                .filters(f -> f.rewritePath("/gateway/users/register",
                                                                "/api/v1/users/register"))
                                                .uri(ROLES))
                                .route("users-create", r -> r.path("/gateway/users").and().method("POST")
                                                .filters(f -> f.rewritePath("/gateway/users", "/api/v1/users"))
                                                .uri(ROLES))
                                .route("users-protected", r -> r.path("/gateway/users/**")
                                                .filters(f -> f.rewritePath("/gateway/users(?<seg>/?.*)",
                                                                "/api/v1/users${seg}"))
                                                .uri(ROLES))
                                .route("pagos", r -> r.path("/gateway/pagos/**")
                                                .filters(f -> f.rewritePath("/gateway/pagos(?<seg>/?.*)",
                                                                "/pago${seg}"))
                                                .uri(PAGOS))
                                .route("stock", r -> r.path("/gateway/stock/**")
                                                .filters(f -> f.rewritePath("/gateway/stock(?<seg>/?.*)",
                                                                "/api/v1/products${seg}"))
                                                .uri(STOCK))
                                .route("stock-categories", r -> r.path("/gateway/categories/**")
                                                .filters(f -> f.rewritePath("/gateway/categories(?<seg>/?.*)",
                                                                "/api/v1/categories${seg}"))
                                                .uri(STOCK))
                                .route("citas", r -> r.path("/gateway/citas/**")
                                                .filters(f -> f.rewritePath("/gateway/citas(?<seg>/?.*)",
                                                                "/api/v1/citas${seg}"))
                                                .uri(AGENDA))
                                .route("clientes", r -> r.path("/gateway/clientes/**")
                                                .filters(f -> f.rewritePath("/gateway/clientes(?<seg>/?.*)",
                                                                "/api/v1/clientes${seg}"))
                                                .uri(AGENDA))
                                .route("tecnicos-exact", r -> r.path("/gateway/tecnicos").and().method("GET")
                                                .filters(f -> f.rewritePath("/gateway/tecnicos", "/api/v1/tecnicos"))
                                                .uri(AGENDA))
                                .route("tecnicos", r -> r.path("/gateway/tecnicos/**")
                                                .filters(f -> f.rewritePath("/gateway/tecnicos(?<seg>/?.*)",
                                                                "/api/v1/tecnicos${seg}"))
                                                .uri(AGENDA))
                                .build();
        }
}