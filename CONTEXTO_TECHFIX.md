# CONTEXTO DEL PROYECTO: TechFix

> Documento de referencia rápida para agentes de IA. Cubre arquitectura, servicios, API completa, modelos de datos, frontend y credenciales de desarrollo.

---

## 1. Descripción General

**TechFix** es una plataforma web de gestión para un taller de reparación de electrónica y venta de repuestos. Fue desarrollada como proyecto universitario de 5to semestre.

Permite:
- Agendar citas de servicio técnico (reparación e instalación).
- Gestionar un catálogo/inventario de repuestos con carrito de compras.
- Registrar y administrar pagos (tickets de servicio y órdenes de carrito).
- Gestionar usuarios con roles diferenciados.

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, React Router v6, Axios, react-hot-toast |
| Backend | Spring Boot 3 (Java), arquitectura de microservicios |
| Gateway | Spring Cloud Gateway (reactivo) |
| Base de datos | PostgreSQL 16 (una instancia por microservicio) |
| Contenedores | Docker + Docker Compose |
| Auth | JWT (HMAC-SHA256), firmado con secreto compartido entre `svc-roles` y `svc-gateway` |

---

## 3. Arquitectura de Microservicios

```
[Browser :3000]
      │
[Frontend nginx]
      │
[Gateway :8090]  ← valida JWT, añade headers X-User-*
      ├── svc-roles   :8080  → postgres-usuarios (techfix_usuarios)
      ├── svc-pagos   :8081  → postgres-pagos    (techfix_payment)
      ├── svc-stock   :8082  → postgres-stock    (techfix_stock)
      └── svc-agenda  :8083  → postgres-agenda   (techfix_agenda)
```

Todos los servicios están en la red Docker `techfix_net`. El frontend apunta siempre al gateway en `http://localhost:8090`.

---

## 4. Levantar el Proyecto

```bash
docker compose up --build
```

El orden de arranque está controlado por `depends_on` + `healthcheck`. No se necesita hacer nada más.

**Credenciales de admin por defecto:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## 5. Puertos Expuestos

| Servicio | Puerto host |
|---|---|
| Frontend | 3000 |
| Gateway | 8090 |
| svc-roles | 8080 |
| svc-pagos | 8081 |
| svc-stock | 8082 |
| svc-agenda | 8083 |

---

## 6. Variables de Entorno y Secretos

### Gateway (`svc-gateway`)
```
JWT_SECRET=cGFyYWJpZW5vZGViZXJpYXNlc3RhcmJhc2U2NHRlY2hmaXgK
INTERNAL_API_SECRET=techfix-internal-secret-2024
ROLES_SERVICE_URL=http://svc-roles:8080
```

### Roles (`svc-roles`)
```
DB_HOST=postgres-usuarios / DB_NAME=techfix_usuarios
DB_USER=techfix_usr / DB_PASSWORD=UsrS3cur3Pass!
JWT_SECRET=cGFyYWJpZW5vZGViZXJpYXNlc3RhcmJhc2U2NHRlY2hmaXgK
INTERNAL_API_SECRET=techfix-internal-secret-2024
ADMIN_PASSWORD=admin123
JWT_EXPIRATION_MS=86400000  (24h)
```

### Pagos (`svc-pagos`)
```
DB_HOST=postgres-pagos / DB_NAME=techfix_payment
DB_USER=techfix_pay / DB_PASSWORD=PayS3cur3Pass!
```

### Stock (`svc-stock`)
```
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-stock:5432/techfix_stock
SPRING_DATASOURCE_USERNAME=techfix_stock / PASSWORD=StockS3cur3Pass!
```

### Agenda (`svc-agenda`)
```
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-agenda:5432/techfix_agenda
SPRING_DATASOURCE_USERNAME=techfix_agenda / PASSWORD=AgendaS3cur3Pass!
```

---

## 7. Autenticación y Autorización

### JWT
- El token se obtiene en `POST /gateway/users/login`.
- Se envía en el header `Authorization: Bearer <token>`.
- Payload del JWT: `sub` (userId), `role`, `username`.
- Expiración: 24 horas.
- El token se guarda en `localStorage` bajo la clave `techfix_user` como `{ token, user }`.

### Roles disponibles
| Rol | Descripción |
|---|---|
| `CLIENTE` | Rol por defecto al registrarse. Puede agendar citas, ver su propio catálogo/carrito. |
| `TECNICO` | Puede gestionar citas (cambiar estado), ver inventario, ver pagos de servicio. |
| `ADMIN` | Acceso total. Gestión de usuarios, inventario, todos los pagos. |

### Reglas de autorización en el Gateway
**Rutas públicas (sin token):**
- `POST /gateway/users/login`
- `POST /gateway/users/register`
- `POST /gateway/users` (crear usuario)
- `GET /gateway/users/username/{username}`
- `GET /gateway/stock/**`
- `GET /gateway/categories/**`
- `GET /gateway/tecnicos`
- `/actuator/**`

**Solo ADMIN:**
- `GET/DELETE/PATCH/PUT /gateway/users/**` (excepto `/username/`)
- `GET/POST /gateway/pagos/**` (excepto carrito y rutas `/nuevo`, `/alterar`, `/ver`)
- `PUT/DELETE/PATCH /gateway/stock/**`
- `POST /gateway/stock/**` (excepto `/movements`)

**Solo ADMIN o TECNICO (staff):**
- `GET /gateway/pagos/carrito/todas`
- `PATCH /gateway/citas/{id}/estado` (excepto `/marcar-pagado` y `/cancelar-cliente`)
- `DELETE /gateway/citas/{id}`

---

## 8. API Completa por Microservicio

> Todas las rutas se acceden **siempre a través del gateway** con prefijo `/gateway/`.

---

### 8.1 Usuarios (`svc-roles` → `/gateway/users`)

| Método | Ruta Gateway | Descripción | Auth |
|---|---|---|---|
| POST | `/gateway/users/login` | Login. Body: `{username, password}`. Devuelve JWT + datos usuario. | Pública |
| POST | `/gateway/users/register` | Registro (alias). Body: objeto User. | Pública |
| POST | `/gateway/users` | Crear usuario. | Pública |
| GET | `/gateway/users` | Listar todos los usuarios. | ADMIN |
| GET | `/gateway/users/{id}` | Obtener usuario por ID. | ADMIN |
| GET | `/gateway/users/username/{username}` | Obtener por username. | Pública |
| GET | `/gateway/users/role/{role}` | Filtrar por rol (`CLIENTE`, `TECNICO`, `ADMIN`). | ADMIN |
| GET | `/gateway/users/active` | Listar usuarios activos. | ADMIN |
| PUT | `/gateway/users/{id}` | Actualizar datos (no cambia rol). | ADMIN |
| PATCH | `/gateway/users/{id}/assign-role?role=ROL` | Asignar rol. | ADMIN |
| PATCH | `/gateway/users/{id}/toggle-status` | Activar/desactivar usuario. | ADMIN |
| DELETE | `/gateway/users/{id}` | Eliminar usuario (no puede eliminar al único admin activo). | ADMIN |
| PATCH | `/gateway/users/{fromId}/transfer-admin/{toId}` | Transferir rol admin atómicamente. | ADMIN |

**Modelo User:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@techfix.cl",
  "password": "min 6 chars",
  "fullName": "Administrador TechFix",
  "role": "ADMIN",
  "active": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### 8.2 Pagos — Tickets de Servicio (`svc-pagos` → `/gateway/pagos`)

| Método | Ruta Gateway | Descripción | Auth |
|---|---|---|---|
| POST | `/gateway/pagos/nuevo/{citaId}` | Crear pago asociado a una cita. Header opcional `Idempotency-Key: <uuid>` para evitar cobros dobles. | Autenticado |
| GET | `/gateway/pagos/ver/{id}` | Ver datos de un pago. | Autenticado |
| GET | `/gateway/pagos/lista` | Listar todos los pagos. | ADMIN |
| PUT | `/gateway/pagos/alterar/{id}` | Modificar un pago existente. | Autenticado |

**Nota idempotencia:** Si se envía el mismo `Idempotency-Key`, el servidor devuelve el pago original con HTTP 200 sin crear uno nuevo.

---

### 8.3 Pagos — Carrito (`svc-pagos` → `/gateway/pagos/carrito`)

| Método | Ruta Gateway | Descripción | Auth |
|---|---|---|---|
| POST | `/gateway/pagos/carrito/nuevo` | Crear orden de carrito. Body: `{clienteId, metodoPago, referenciaExterna, items:[{productId,qty,unitPrice}]}` | Autenticado |
| GET | `/gateway/pagos/carrito/{id}` | Ver detalle de una orden. | Autenticado |
| GET | `/gateway/pagos/carrito/cliente/{clienteId}` | Ver órdenes de un cliente. | Autenticado |
| GET | `/gateway/pagos/carrito/todas` | Ver todas las órdenes. | ADMIN o TECNICO |

---

### 8.4 Inventario/Stock (`svc-stock` → `/gateway/stock` y `/gateway/categories`)

#### Productos

| Método | Ruta Gateway | Descripción | Auth |
|---|---|---|---|
| GET | `/gateway/stock?page=0&size=20&sortBy=id&direction=asc` | Listar productos paginados. | Pública |
| GET | `/gateway/stock/{id}` | Obtener producto por ID. | Pública |
| GET | `/gateway/stock/sku/{sku}` | Obtener por SKU. | Pública |
| GET | `/gateway/stock/search?q=texto` | Buscar productos. | Pública |
| GET | `/gateway/stock/status/{status}` | Filtrar por estado (`ACTIVE`, `INACTIVE`, `DISCONTINUED`). | Pública |
| GET | `/gateway/stock/category/{categoryId}` | Filtrar por categoría. | Pública |
| GET | `/gateway/stock/alerts/low-stock` | Productos con stock bajo. | Pública |
| GET | `/gateway/stock/alerts/out-of-stock` | Productos sin stock. | Pública |
| GET | `/gateway/stock/stats` | Estadísticas generales de stock. | Pública |
| POST | `/gateway/stock` | Crear producto. | ADMIN |
| PUT | `/gateway/stock/{id}` | Actualizar producto. | ADMIN |
| DELETE | `/gateway/stock/{id}` | Eliminar producto. | ADMIN |
| POST | `/gateway/stock/movements` | Registrar movimiento de stock. | Autenticado |
| PATCH | `/gateway/stock/{id}/adjust-stock` | Ajuste directo de stock. | ADMIN |
| GET | `/gateway/stock/{id}/movements` | Historial de movimientos de un producto. | Pública |

#### Categorías

| Método | Ruta Gateway | Descripción | Auth |
|---|---|---|---|
| GET | `/gateway/categories` | Listar todas las categorías. | Pública |
| GET | `/gateway/categories/{id}` | Obtener categoría por ID. | Pública |
| POST | `/gateway/categories` | Crear categoría. | ADMIN |
| PUT | `/gateway/categories/{id}` | Actualizar categoría. | ADMIN |
| DELETE | `/gateway/categories/{id}` | Eliminar categoría. | ADMIN |

**Modelo Producto (ProductRequest):**
```json
{
  "sku": "BAT-SAM-A54",
  "name": "Batería Original Samsung Galaxy A54",
  "description": "...",
  "brand": "Samsung",
  "model": "A54 5G",
  "costPrice": 15000.00,
  "salePrice": 35000.00,
  "quantityInStock": 50,
  "minStockLevel": 5,
  "maxStockLevel": 100,
  "status": "ACTIVE",
  "categoryId": 1,
  "barcode": "123456789001",
  "location": "Estante A1",
  "imageUrl": "/imgrepuestos/bateriasamsunga54.png",
  "notes": "Requiere instalación profesional."
}
```

**Datos semilla de stock (productos iniciales):**
- `BAT-SAM-A54` — Batería Samsung Galaxy A54 — $35.000 — Cat: Smartphones
- `PANT-IPH-13` — Pantalla OLED iPhone 13 — $120.000 — Cat: Smartphones
- `RAM-DDR4-16GB-3200` — RAM Kingston 16GB DDR4 — $48.000 — Cat: Componentes PC
- `COOL-NOCT-NHU12S` — Cooler Noctua NH-U12S — $75.000 — Cat: Componentes PC
- `GPU-RTX-3060` — RTX 3060 12GB — $360.000 — Cat: Componentes PC

**Categorías iniciales:** Smartphones (1), Componentes PC (2), Accesorios (3).

---

### 8.5 Agenda (`svc-agenda` → `/gateway/citas`, `/gateway/clientes`, `/gateway/tecnicos`)

#### Citas

| Método | Ruta Gateway | Descripción | Auth |
|---|---|---|---|
| GET | `/gateway/citas` | Listar todas las citas. | Autenticado |
| GET | `/gateway/citas/{id}` | Ver cita por ID. | Autenticado |
| GET | `/gateway/citas/cliente/{clienteId}` | Citas de un cliente. | Autenticado |
| GET | `/gateway/citas/tecnico/{tecnicoId}` | Citas de un técnico. | Autenticado |
| GET | `/gateway/citas/estado/{estado}` | Filtrar por estado. | Autenticado |
| GET | `/gateway/citas/resumen-por-comuna` | Resumen estadístico por comuna. | Autenticado |
| POST | `/gateway/citas` | Crear cita. | Autenticado |
| PATCH | `/gateway/citas/{id}/estado` | Cambiar estado. Body: `{estado}`. | ADMIN o TECNICO |
| PATCH | `/gateway/citas/{id}/precio` | Asignar precio cotizado. Body: `{precioCotizado}`. | ADMIN o TECNICO |
| PATCH | `/gateway/citas/{id}/marcar-pagado` | Marcar como pagada. | Autenticado |
| PATCH | `/gateway/citas/{id}/gestionar` | Gestionar servicio (precio + descripción + acción + metodoPago). | ADMIN o TECNICO |
| PATCH | `/gateway/citas/{id}/cancelar-cliente` | Cancelar cita por el cliente. Body: `{motivo}`. | Autenticado |
| DELETE | `/gateway/citas/{id}` | Eliminar cita. | ADMIN o TECNICO |

**Modelo CitaRequest:**
```json
{
  "fechaHora": "2025-12-01T10:00:00",
  "tipoServicio": "REPARACION",
  "descripcion": "Pantalla rota",
  "comuna": "Providencia",
  "clienteId": 1,
  "tecnicoId": 2
}
```

**Estados de cita:** `PENDIENTE` → `EN_PROCESO` → `COMPLETADA` / `CANCELADA`

**EstadoPagoTicket:** `SIN_PRECIO` → (técnico asigna precio) → `PENDIENTE` → `PAGADO`

**GestionServicioRequest (para `/gestionar`):**
```json
{
  "precio": 25000.00,
  "descripcionRealizado": "Se reemplazó la pantalla.",
  "accion": "COMPLETAR",
  "metodoPago": "EFECTIVO"
}
```

#### Clientes (del servicio de agenda)

| Método | Ruta Gateway | Descripción | Auth |
|---|---|---|---|
| GET | `/gateway/clientes` | Listar todos. | Autenticado |
| GET | `/gateway/clientes/{id}` | Por ID. | Autenticado |
| GET | `/gateway/clientes/by-email/{email}` | Por email. | Autenticado |
| POST | `/gateway/clientes` | Crear cliente. Body: `{nombre, apellido, email, telefono}` | Autenticado |
| PUT | `/gateway/clientes/{id}` | Actualizar. | Autenticado |
| DELETE | `/gateway/clientes/{id}` | Eliminar. | Autenticado |

> **Nota:** Los clientes de la agenda (`/gateway/clientes`) son una entidad separada de los usuarios del sistema (`/gateway/users`). Un usuario con rol CLIENTE puede tener asociado un registro de cliente en la agenda.

#### Técnicos

| Método | Ruta Gateway | Descripción | Auth |
|---|---|---|---|
| GET | `/gateway/tecnicos` | Listar todos los técnicos. | Pública |
| GET | `/gateway/tecnicos/activos` | Solo técnicos activos. | Autenticado |
| GET | `/gateway/tecnicos/{id}` | Por ID. | Autenticado |
| POST | `/gateway/tecnicos` | Crear técnico. Body: `{nombre, apellido, email, telefono, especialidad, activo}` | Autenticado |
| PUT | `/gateway/tecnicos/{id}` | Actualizar. | Autenticado |
| DELETE | `/gateway/tecnicos/{id}` | Eliminar. | Autenticado |

---

## 9. Frontend

### Rutas de la App

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | Home | Público |
| `/catalogo` | Catalogo | Público |
| `/catalogo/:id` | ProductoDetalle | Público |
| `/login` | Login | Público |
| `/register` | Register | Público |
| `/agendamiento` | Agendamiento | Autenticado |
| `/ordenes` | Ordenes | Autenticado |
| `/pago-carrito` | PagoCarrito | Autenticado |
| `/pago-ticket/:citaId` | PagoTicket | Autenticado |
| `/pagos` | Pagos | TECNICO o ADMIN |
| `/inventario` | Inventario | TECNICO o ADMIN |
| `/usuarios` | Usuarios | ADMIN |
| `/admin` | Admin | ADMIN |

### Instancias Axios (en `src/services/api.js`)

| Variable | Base URL |
|---|---|
| `userApi` | `{GATEWAY}/gateway/users` |
| `paymentApi` | `{GATEWAY}/gateway/pagos` |
| `inventoryApi` | `{GATEWAY}/gateway/stock` |
| `scheduleApi` | `{GATEWAY}/gateway/citas` |
| `clientesApi` | `{GATEWAY}/gateway/clientes` |
| `tecnicosApi` | `{GATEWAY}/gateway/tecnicos` |

`GATEWAY` se define en `.env` como `VITE_GATEWAY_URL` (vacío en producción, se usa proxy Nginx).

Todos los clientes Axios tienen interceptores que:
1. Inyectan automáticamente el token JWT desde `localStorage`.
2. Manejan errores globales (401 → logout, 403 → toast, etc.).

### Contextos de React

**AuthContext** (`src/context/AuthContext.jsx`):
- Persiste sesión en `localStorage` con clave `techfix_user`.
- Expone: `user`, `token`, `loading`, `login(username, password)`, `register(data)`, `logout()`.

**CartContext** (`src/context/CartContext.jsx`):
- Carrito por usuario (clave `techfix_carts` en localStorage).
- Expone: `cart`, `addToCart(product, qty)`, `removeFromCart(id)`, `updateQty(id, qty)`, `clearCart()`, `totalItems`, `totalPrice`.
- Respeta el stock máximo disponible.

### Páginas Principales

- **Home**: Landing con hero section y acceso al catálogo.
- **Catalogo**: Listado paginado de productos con búsqueda y filtro por categoría.
- **ProductoDetalle**: Vista individual del producto con botón "Añadir al carrito".
- **Agendamiento**: Formulario para crear citas, vista de citas propias, posibilidad de cancelar.
- **Ordenes**: Gestión de citas (para técnicos/admin: cambio de estado, gestión del servicio).
- **Inventario**: CRUD de productos y categorías (TECNICO/ADMIN).
- **Pagos**: Lista de pagos de ticket de servicio (TECNICO/ADMIN).
- **PagoCarrito**: Checkout del carrito de compras con selección de método de pago.
- **PagoTicket**: Pago de un ticket de servicio técnico específico.
- **Usuarios**: CRUD de usuarios del sistema (ADMIN).
- **Admin**: Dashboard con estadísticas generales (ADMIN).

---

## 10. Estructura de Directorios

```
TechFix-main/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── services/api.js
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── CartContext.jsx
│       ├── components/
│       │   ├── ProtectedRoute.jsx
│       │   ├── layout/ (Navbar.jsx, Footer.jsx)
│       │   └── ui/ (CardPaymentForm, ProductCard, StatusBadge, ServiceUnavailable)
│       ├── hooks/
│       │   ├── useAdminStats.js
│       │   ├── useAgendamiento.js
│       │   ├── useCarritoApi.js
│       │   ├── useInventario.js
│       │   ├── usePagos.js
│       │   └── useUsuarios.js
│       └── pages/
│           ├── Home, Catalogo, ProductoDetalle
│           ├── Login, Register
│           ├── Agendamiento, Ordenes
│           ├── PagoCarrito, PagoTicket, Pagos
│           ├── Inventario, Usuarios, Admin
└── microservicios/
    ├── gateway/   (Spring Cloud Gateway, puerto 8090)
    ├── roles/     (Spring Boot + Maven, puerto 8080)
    ├── pagos/     (Spring Boot + Maven, puerto 8081)
    ├── stock/     (Spring Boot + Maven, puerto 8082)
    └── agenda/    (Spring Boot + Maven, puerto 8083)
```

---

## 11. Convenciones y Notas Importantes

- **Precios** están en pesos chilenos (CLP) sin decimales visibles. Se usan `BigDecimal` en backend.
- **El gateway reescribe las rutas:** la ruta `/gateway/stock/**` se convierte en `/api/v1/products/**` al llegar a `svc-stock`. Tener esto en cuenta al debuggear.
- **Cabeceras inyectadas por el gateway** en cada request autenticado: `X-User-Id`, `X-User-Role`, `X-User-Username`, `X-Internal-Secret`.
- **`svc-pagos`** acepta idempotencia vía header `Idempotency-Key` (UUID v4) en la creación de pagos.
- **Los técnicos** de la agenda son una entidad separada de los usuarios del sistema. Un técnico del sistema (rol `TECNICO`) puede estar asociado a un registro en la tabla `tecnicos` de la agenda.
- **DDL automático:** todos los servicios usan `spring.jpa.hibernate.ddl-auto=update`. Las tablas se crean/actualizan al arrancar.
- **Datos semilla:** `svc-stock` carga datos vía `data.sql` al iniciar (categorías y 5 productos de ejemplo).
- **El número de orden** (`numeroOrden`) de las citas se genera automáticamente en el backend.
- **Imágenes de repuestos** están en `frontend/public/imgrepuestos/` y se sirven como archivos estáticos.
