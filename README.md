# TechFix - Portal de Servicio Técnico

Esta es una aplicación web completa con microservicios Java Spring Boot y frontend React.

## Requisitos
- Docker y Docker Compose
- Descomprimir los microservicios proporcionados en los directorios correspondientes

## Instrucciones de Uso

1. Coloca los zips de microservicios en `./microservicios/roles` y `./microservicios/pagos`.
   - El microservicio de roles debe estar en `./microservicios/roles/modification`
   - El microservicio de pagos debe estar en `./microservicios/pagos/techfix-payment`
2. Ejecuta `docker compose up --build` en la raíz del proyecto.
3. Abre `http://localhost:3000` en tu navegador.

## Microservicios

- Usuarios/Roles: Puerto 8080 (Activo)
- Pagos/Facturación: Puerto 8081 (Activo)
- Inventario: Puerto 8082 (Pendiente)
- Agendamiento: Puerto 8083 (Pendiente)
- Órdenes: Puerto 8084 (Pendiente)
