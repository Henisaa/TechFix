package com.techfix.gateway.filter;

import com.techfix.gateway.dto.UserDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@Slf4j
public class AuthFilter implements GlobalFilter, Ordered {

    private final WebClient webClient;

    @Value("${ROLES_SERVICE_URL:http://svc-roles:8080}")
    private String rolesServiceUrl;

    public AuthFilter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public int getOrder() {
        return -100;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        String method = exchange.getRequest().getMethod().name();

        log.debug("Gateway request: {} {}", method, path);

        if (isPublicRoute(path, method)) {
            return chain.filter(exchange);
        }

        String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
        if (userId == null || userId.isBlank()) {
            return respondError(exchange, HttpStatus.UNAUTHORIZED,
                    "{\"error\":\"Authentication required\",\"message\":\"Missing X-User-Id header\"}");
        }

        return webClient.get()
                .uri(rolesServiceUrl + "/api/v1/users/" + userId)
                .retrieve()
                .bodyToMono(UserDto.class)
                .flatMap(user -> {
                    if (user == null || !Boolean.TRUE.equals(user.getActive())) {
                        return respondError(exchange, HttpStatus.UNAUTHORIZED,
                                "{\"error\":\"Unauthorized\",\"message\":\"User inactive or not found\"}");
                    }

                    String role = user.getRole() != null ? user.getRole() : "USER";

                    if (requiresAdmin(path, method) && !"ADMIN".equals(role)) {
                        return respondError(exchange, HttpStatus.FORBIDDEN,
                                "{\"error\":\"Forbidden\",\"message\":\"Admin access required\"}");
                    }

                    if (requiresStaff(path, method) && !"ADMIN".equals(role) && !"TECNICO".equals(role)) {
                        return respondError(exchange, HttpStatus.FORBIDDEN,
                                "{\"error\":\"Forbidden\",\"message\":\"Staff access required (ADMIN or TECNICO)\"}");
                    }

                    ServerHttpRequest mutated = exchange.getRequest().mutate()
                            .header("X-User-Role", role)
                            .header("X-User-Username", user.getUsername())
                            .build();

                    log.debug("Auth OK → user={} role={} → {}", user.getUsername(), role, path);
                    return chain.filter(exchange.mutate().request(mutated).build());
                })
                .onErrorResume(WebClientResponseException.class, e -> {
                    log.warn("Roles service error for userId={}: {}", userId, e.getStatusCode());
                    if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                        return respondError(exchange, HttpStatus.UNAUTHORIZED,
                                "{\"error\":\"Unauthorized\",\"message\":\"User not found\"}");
                    }
                    return respondError(exchange, HttpStatus.SERVICE_UNAVAILABLE,
                            "{\"error\":\"ServiceUnavailable\",\"message\":\"Auth service unavailable\"}");
                })
                .onErrorResume(Exception.class, e -> {
                    log.error("Auth filter unexpected error: {}", e.getMessage());
                    return respondError(exchange, HttpStatus.SERVICE_UNAVAILABLE,
                            "{\"error\":\"ServiceUnavailable\",\"message\":\"Auth service unavailable\"}");
                });
    }

    private boolean isPublicRoute(String path, String method) {
        if ("POST".equals(method) && "/gateway/users/login".equals(path))
            return true;
        if ("POST".equals(method) && "/gateway/users/register".equals(path))
            return true;
        if (path.startsWith("/gateway/users/username/"))
            return true;
        if ("POST".equals(method) && "/gateway/users".equals(path))
            return true;
        if ("GET".equals(method) && path.startsWith("/gateway/stock"))
            return true;
        if ("GET".equals(method) && path.startsWith("/gateway/categories"))
            return true;
        if ("GET".equals(method) && path.startsWith("/gateway/tecnicos"))
            return true;
        if (path.startsWith("/actuator"))
            return true;
        return false;
    }

    private boolean requiresAdmin(String path, String method) {
        if (path.startsWith("/gateway/users") && !path.contains("/username/")
                && List.of("GET", "DELETE", "PATCH", "PUT").contains(method))
            return true;
        if (path.startsWith("/gateway/pagos"))
            return true;
        if (path.startsWith("/gateway/stock")
                && List.of("POST", "PUT", "DELETE", "PATCH").contains(method))
            return true;
        return false;
    }

    private boolean requiresStaff(String path, String method) {
        if (path.startsWith("/gateway/citas") && "PATCH".equals(method))
            return true;
        if (path.startsWith("/gateway/citas") && "DELETE".equals(method))
            return true;
        return false;
    }

    private Mono<Void> respondError(ServerWebExchange exchange, HttpStatus status, String body) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        var buffer = response.bufferFactory().wrap(body.getBytes());
        return response.writeWith(Mono.just(buffer));
    }
}