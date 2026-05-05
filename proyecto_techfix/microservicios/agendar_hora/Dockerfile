# ── Stage 1: Build ──────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache dependencies layer separately for faster rebuilds
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build the application
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -S techfix && adduser -S techfix -G techfix
USER techfix

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8002

ENTRYPOINT ["java", "-jar", "app.jar"]
