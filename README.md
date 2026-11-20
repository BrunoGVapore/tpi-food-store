# Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador · Programación 4 · Bruno Giuliano Vapore

Aplicación web para un negocio de comidas:

- **Clientes:** se registran, recorren el catálogo, arman un carrito y confirman pedidos con dirección de entrega y forma de pago (efectivo o transferencia).
- **Administrador:** gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

| | |
|---|---|
| **Repositorio** | https://github.com/BrunoGVapore/tpi-food-store.git |
| **Video de demostración** | https://youtu.be/kpJ5CnqeDd0 |



## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 |
| PostgreSQL | 15 o superior |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

## Estructura del repositorio

```
food-store/
├── backend/      API REST con FastAPI + SQLModel + PostgreSQL
├── frontend/     SPA con React + TypeScript + Vite + Tailwind
└── README.md     (este archivo)
```

---

## 1. Backend

Todos los comandos se ejecutan dentro de la carpeta `backend/`.

### 1.1. Crear la base de datos

Crear una base **vacía** en PostgreSQL. Por ejemplo, desde pgAdmin (Query Tool) o desde `psql`:

```sql
CREATE DATABASE foodstore_db;
```

### 1.2. Entorno virtual y dependencias

Abrir una terminal en la carpeta `backend/`. En VS Code: abrir la carpeta del proyecto y usar **Terminal → New Terminal**, y luego entrar a la carpeta:

```bash
cd backend
```

Crear y activar el entorno virtual:

```bash
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate
```

Al activarlo, la terminal muestra `(.venv)` al principio de la línea. Instalar las dependencias:

```bash
python -m pip install -r requirements.txt
```

### 1.3. Variables de entorno

1. Copiar la plantilla `.env.example` como `.env`:

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

2. Generar una clave secreta para firmar el JWT:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

3. Abrir `backend/.env` con un editor y reemplazar:
   - `cambiar_password` en `DATABASE_URL` por la contraseña del usuario `postgres` de tu PostgreSQL.
   - El valor de `SECRET_KEY` por la clave generada en el paso 2.

Ejemplo de `.env` completo:

```
DATABASE_URL=postgresql://postgres:MiPassword123@localhost:5432/foodstore_db
SECRET_KEY=9f2c4e7a1b8d3f6e0a5c2b9d4e7f1a3c6b8d0e2f4a6c8e0b2d4f6a8c0e2b4d6f
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

> Si tu PostgreSQL usa otro usuario o puerto, cambialos también en `DATABASE_URL` (formato: `postgresql://USUARIO:PASSWORD@HOST:PUERTO/BASE`).

### 1.4. Datos iniciales (seed)

```bash
python -m app.db.seed
```

Crea las tablas y carga el usuario administrador, 5 categorías y 10 productos con stock. Es **idempotente**: se puede ejecutar varias veces sin duplicar datos.

**Usuario administrador:**

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |

Los clientes se crean desde la pantalla de registro, siempre con rol `user`.

### 1.5. Ejecutar la API

```bash
uvicorn app.main:app --reload
```
- URL base de la API: `http://localhost:8000/api/v1` 
- Documentación interactiva: http://localhost:8000/docs (Swagger) y http://localhost:8000/redoc

### 1.6. Probar la API

**Opción A: documentación interactiva.** En http://localhost:8000/docs cada endpoint tiene un botón **Try it out**. Para probar los endpoints protegidos, primero ejecutar `POST /api/v1/auth/token` con `admin` / `Admin1234!`: el navegador guarda la cookie de sesión y la envía en las siguientes peticiones.

**Opción B: colección `backend/api.http`.**

1. Instalar la extensión **REST Client**.
2. Abrir `backend/api.http` y hacer clic en **Send Request** sobre cada petición, **en orden, de arriba hacia abajo**. La cookie de sesión se conserva entre peticiones.
3. La colección recorre:
   - catálogo público y sus errores (404, 401);
   - login de admin y ABM de categorías y productos (409, 422);
   - registro y login de un cliente;
   - compra, que descuenta el stock;
   - compra con producto repetido o stock insuficiente (400);
   - cancelación con restitución de stock;
   - máquina de estados del pedido (transiciones válidas e inválidas);
   - resumen del negocio y activación o desactivación de usuarios.

> Los ids de la colección suponen una base recién cargada con el seed (por ejemplo, la categoría creada es la 6 y el producto creado, el 11). Para repetir las pruebas desde cero, borrar y volver a crear la base `foodstore_db`, y ejecutar otra vez `python -m app.db.seed`.

La colección registra un cliente de prueba: `cliente1` / `Cliente1234!`.

---

## 2. Frontend

Abrir **una segunda terminal** (el backend sigue corriendo en la primera) y entrar a la carpeta del frontend:

```bash
cd frontend
```

1. (Opcional) Copiar las variables de entorno. Si no se crea el `.env`, se usa el mismo valor por defecto:

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

2. Instalar las dependencias:

```bash
pnpm install
```

3. Generar la versión de producción (verifica los tipos) y levantar el servidor de desarrollo:

```bash
pnpm build
pnpm dev      # http://localhost:5173
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

> Abrir la aplicación en **http://localhost:5173** (no `127.0.0.1`), porque es el origen que el backend acepta por CORS para enviar la cookie de sesión.

---

## 3. Funcionalidades

### Cliente (rol `user`)
- Registro e inicio de sesión (TanStack Form con validaciones).
- Catálogo público con paginación en el servidor, búsqueda por nombre, filtro por categoría, skeleton mientras carga y estado vacío.
- Carrito que persiste al recargar la página: cantidades limitadas al stock, subtotales y total.
- Checkout con dirección de entrega, forma de pago y notas.
- «Mis pedidos»: listado con filtro por estado, detalle y cancelación mientras el pedido está `PENDIENTE`.

### Administrador (rol `admin`)
- **Resumen:** pedidos de hoy, ingresos de pedidos entregados y cantidad por estado.
- **Pedidos:** tabla con filtro por estado y botones para avanzar o cancelar según la máquina de estados.
- **Productos:** ABM con TanStack Table y TanStack Form, cambio de stock y disponibilidad, y baja lógica.
- **Categorías:** ABM con baja lógica.
- **Usuarios:** activar y desactivar cuentas. El botón «Desactivar» no aparece en la fila del propio admin.

### Reglas de negocio
| Regla | Implementación |
|---|---|
| RN-01 Crear pedido | Al menos un ítem y sin productos repetidos. Cada producto debe estar activo, disponible y con stock. Por cada ítem se verifica el stock, se descuenta y se crea la línea copiando nombre y precio. Todo ocurre en una sola transacción. |
| RN-02 Transiciones | `PENDIENTE → EN_PREPARACION / CANCELADO` y `EN_PREPARACION → ENTREGADO / CANCELADO`. Los estados terminales no cambian. Una transición inválida responde 400. |
| RN-03 Cancelar | Restituye el stock de cada línea en la misma transacción que cambia el estado. |
| RN-04 Permisos | El cliente ve y cancela solo sus pedidos, y solo en `PENDIENTE`. El admin ve todos los pedidos y los gestiona. |
| RN-05 Inmutabilidad | Las líneas y el total no cambian después de creado el pedido. No hay edición ni borrado de pedidos. |
| RN-06 Datos del pedido | `forma_pago` debe ser `EFECTIVO` o `TRANSFERENCIA`, y la dirección debe tener entre 5 y 200 caracteres. |

---

## 4. Arquitectura

### Backend: módulos por dominio y capas

```
backend/app/
├── main.py                 FastAPI, CORS con credenciales y routers bajo /api/v1
├── core/
│   ├── config.py           Settings (pydantic-settings, lee .env)
│   ├── database.py         engine, create_all_tables y session_factory
│   ├── security.py         bcrypt, create_access_token y decode_access_token
│   ├── deps.py             get_current_user (lee la cookie), get_current_active_user y require_role
│   ├── unit_of_work.py     UnitOfWork: commit / rollback / close en __exit__
│   └── base_repository.py  BaseRepository[T]: get_by_id, get_all, add y delete
├── modules/
│   ├── auth/               router, service, schemas (registro, login, logout y /me)
│   ├── usuarios/           models, schemas, repository, unit_of_work, service y router
│   ├── categorias/         ídem
│   ├── productos/          ídem
│   └── pedidos/            ídem: RN-01 a RN-06, mapa de transiciones y resumen
└── db/seed.py              datos iniciales idempotentes
```

- **Flujo de dependencias:** Router → Service → Unit of Work → Repository → Model.
- **Router:** obtiene el Service con `Depends(get_<modulo>_service)` y traduce las excepciones de dominio a códigos HTTP. Por ejemplo, `StockInsuficiente` → 400, `PedidoAjeno` → 403, `ProductoNoEncontrado` → 404 y `NombreDuplicado` → 409.
- **Service:** abre `with self.uow as uow:`, aplica las reglas de negocio y devuelve el schema de salida dentro del bloque.
- **Commit:** **ningún Service ni Router llama a `session.commit()`**; lo hace el Unit of Work al salir del bloque, o hace rollback si hubo una excepción.
- **Sesión:** el JWT viaja solo en la cookie HttpOnly `access_token`, con una duración de 30 minutos.

### Frontend: organización por features

```
frontend/src/
├── features/
│   ├── auth/         LoginPage, RegisterPage, UnauthorizedPage
│   ├── categorias/   AdminCategoriasPage, useCategorias
│   ├── productos/    CatalogoPage, AdminProductosPage, ProductoCard, useProductos
│   ├── pedidos/      CarritoPage, CheckoutPage, MisPedidosPage, AdminPedidosPage, AdminResumenPage, hooks de pedidos
│   └── usuarios/     AdminUsuariosPage, useUsuarios
│       (cada feature: api/, components/, hooks/, pages/, types/ e index.ts como API pública)
├── shared/
│   ├── api/          axiosInstance (withCredentials + interceptor), handleApiError, queryClient
│   ├── ui/           Button, Card, Input, Modal, BadgeEstado
│   ├── components/   Paginacion, Skeleton, EstadoVacio, EstadoError, DataTable, Toast
│   └── layout/       Navbar, MainLayout, AdminLayout
├── store/            authStore (persist con partialize) y cartStore (persist)
├── routes/           AppRouter y ProtectedRoute
├── App.tsx           checkSession al montar + AppRouter
└── main.tsx          QueryClientProvider
```

- **Estado del servidor:** lo maneja TanStack Query (catálogo, pedidos, usuarios y resumen), con `queryKey` descriptivas e invalidación después de cada mutación.
- **Estado del cliente:** lo maneja Zustand. `authStore` guarda solo los datos públicos del usuario (`partialize`), **nunca el token**, y `cartStore` guarda el carrito.
- **Interceptor de Axios:** ante un 401 fuera de `/auth/token` y `/auth/me`, o ante «Cuenta de usuario desactivada», limpia la sesión.
- **`ProtectedRoute`:** muestra un indicador mientras se verifica la sesión, redirige a `/login` si no hay sesión y a `/unauthorized` si falta el rol.
- **Protección real:** la hace el backend con `require_role`.
- **Rutas:**
  - Públicas: `/`, `/login`, `/register`, `/carrito` y `/unauthorized`.
  - Con sesión: `/checkout` y `/mis-pedidos`.
  - Admin: `/admin/resumen`, `/admin/pedidos`, `/admin/productos`, `/admin/categorias` y `/admin/usuarios`.

---

## 5. Endpoints principales (`/api/v1`)

| Método | Endpoint | Acceso |
|---|---|---|
| POST | `/auth/register` · `/auth/token` · `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET · POST | `/admin/usuarios` · `/admin/usuarios/{id}/activar` · `/admin/usuarios/{id}/desactivar` | admin |
| GET | `/categorias` · `/categorias/{id}` | Público |
| POST · PUT · DELETE | `/categorias` · `/categorias/{id}` | admin |
| GET | `/productos?skip&limit&search&categoria_id&disponible` · `/productos/{id}` | Público |
| POST · PUT · PATCH · DELETE | `/productos` · `/productos/{id}` · `/productos/{id}/stock` | admin |
| POST · GET | `/pedidos` (el cliente ve los propios; el admin, todos) | Sesión |
| GET | `/pedidos/resumen` | admin |
| GET | `/pedidos/{id}` | Dueño o admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| PATCH | `/pedidos/{id}/cancelar` | Dueño |

La documentación completa, con schemas y códigos de respuesta, está en `/docs`.
