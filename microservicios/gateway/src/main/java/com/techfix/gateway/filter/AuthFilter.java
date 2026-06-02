package com.techfix.gateway.filter;

import com.techfix.gateway.jwt.JwtValidator;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthFilter implements GlobalFilter, Ordered {

    private final JwtValidator jwtValidator;

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

        String authorization = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (authorization == null || authorization.isBlank() || !authorization.startsWith("Bearer ")) {
            return respondError(exchange, HttpStatus.UNAUTHORIZED,
                    "{\"error\":\"Authentication required\",\"message\":\"Missing or invalid Authorization header\"}");
        }

        String token = authorization.substring(7);

        if (!jwtValidator.isValid(token)) {
            return respondError(exchange, HttpStatus.UNAUTHORIZED,
                    "{\"error\":\"Unauthorized\",\"message\":\"Token inválido o expirado\"}");
        }

        Claims claims = jwtValidator.getClaims(token);
        String userId   = claims.getSubject();
        String role     = claims.get("role", String.class);
        String username = claims.get("username", String.class);

        if (requiresAdmin(path, method) && !"ADMIN".equals(role)) {
            return respondError(exchange, HttpStatus.FORBIDDEN,
                    "{\"error\":\"Forbidden\",\"message\":\"Admin access required\"}");
        }

        if (requiresStaff(path, method) && !"ADMIN".equals(role) && !"TECNICO".equals(role)) {
            return respondError(exchange, HttpStatus.FORBIDDEN,
                    "{\"error\":\"Forbidden\",\"message\":\"Staff access required (ADMIN or TECNICO)\"}");
        }

        ServerHttpRequest mutated = exchange.getRequest().mutate()
                .header("X-User-Id", userId)
                .header("X-User-Role", role)
                .header("X-User-Username", username)
                .build();

        log.debug("Auth OK → user={} role={} → {}", username, role, path);
        return chain.filter(exchange.mutate().request(mutated).build());
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
        if (path.equals("/gateway/pagos/carrito/todas"))
            return true;
        if (path.startsWith("/gateway/pagos") && !path.startsWith("/gateway/pagos/carrito"))
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