# Orders API

API REST para la gestión de órdenes de compra, desarrollada con NestJS + Fastify aplicando DDD, Arquitectura Hexagonal y CQRS-lite.

**Autor:** Niclas Avellaneda

---

## Sobre la implementación

Se implementaron todos los requerimientos funcionales y técnicos solicitados en el desafío. Adicionalmente, se incorporaron validaciones extra no especificadas que refuerzan la consistencia del dominio:

| Validación                                    | Solicitada | Implementada |
| --------------------------------------------- | ---------- | ------------ |
| No pagar una orden cancelada                  | ✅         | ✅           |
| No cancelar una orden pagada                  | ✅         | ✅           |
| No pagar una orden ya pagada                  | —          | ✅           |
| No cancelar una orden ya cancelada            | —          | ✅           |
| Array de items vacío rechazado con 400        | —          | ✅           |
| UUID inválido en path param rechazado con 400 | —          | ✅           |

Estas validaciones viven en la capa de dominio (`Order.pay()`, `Order.cancel()`) y en la capa de interfaces (DTOs + pipes), respetando la separación de responsabilidades de la arquitectura.

---

## Requisitos previos

- Node.js 20+
- Docker y Docker Compose

---

## Configuración e inicio

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd orders-api

# 2. Crear el archivo de variables de entorno
cp .env.example .env
# Completar los valores en .env

# 3. Levantar la base de datos PostgreSQL
docker-compose up -d

# 4. Instalar dependencias
npm install

# 5. Ejecutar las migraciones
npm run migration:run

# 6. Iniciar la aplicación
npm run start:dev
```

La API estará disponible en `http://localhost:3000`.

---

## Variables de entorno

| Variable      | Descripción                | Ejemplo       |
| ------------- | -------------------------- | ------------- |
| `DB_HOST`     | Host de PostgreSQL         | `localhost`   |
| `DB_PORT`     | Puerto de PostgreSQL       | `5432`        |
| `DB_USER`     | Usuario de PostgreSQL      | `orders_user` |
| `DB_PASSWORD` | Contraseña del usuario     | `orders_pass` |
| `DB_NAME`     | Nombre de la base de datos | `orders_db`   |
| `PORT`        | Puerto HTTP de la API      | `3000`        |

---

## Migraciones

```bash
# Aplicar todas las migraciones pendientes
npm run migration:run

# Revertir la última migración
npm run migration:revert

# Generar una nueva migración a partir de cambios en entidades
npm run migration:generate -- src/infrastructure/persistence/migrations/<NombreMigracion>
```

---

## Tests

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov
```

---

## Endpoints

| Método | Ruta                 | Descripción                     |
| ------ | -------------------- | ------------------------------- |
| POST   | `/orders`            | Crear una nueva orden           |
| GET    | `/orders`            | Listar todas las órdenes        |
| GET    | `/orders/:id`        | Obtener una orden por ID        |
| POST   | `/orders/:id/pay`    | Marcar una orden como PAID      |
| POST   | `/orders/:id/cancel` | Marcar una orden como CANCELLED |

Ver `postman_collection.json` para ejemplos completos de requests y responses.

### Uso de la colección Postman

1. Importar `postman_collection.json` en Postman.
2. Verificar que la variable `{{baseUrl}}` esté configurada como `http://localhost:3000`.
3. Ejecutar **Create Order** primero — el script de test guarda automáticamente el `id` de la orden creada en la variable `{{orderId}}`.
4. Los requests de **Get Order By ID**, **Pay Order** y **Cancel Order** usan `{{orderId}}` automáticamente, sin necesidad de copiar el ID a mano.

---

## Resetear la base de datos (entorno local)

```bash
# Opción 1 — revertir y reaplicar migración
npm run migration:revert
npm run migration:run

# Opción 2 — bajar el contenedor eliminando el volumen (más rápido)
docker-compose down -v
docker-compose up -d
npm run migration:run
```

---

## Decisiones técnicas

### Arquitectura Hexagonal

El proyecto se divide en cuatro capas con dependencias estrictamente dirigidas hacia adentro:

- **Domain** — TypeScript puro: Entidades, Value Objects, Aggregate Root, interfaz de Repositorio. Sin dependencias externas.
- **Application** — Orquestación mediante Commands y Queries. Los handlers cargan del repositorio, invocan métodos del dominio, persisten y retornan. Sin lógica de negocio.
- **Infrastructure** — Entidades ORM de TypeORM, mappers explícitos domain↔ORM, implementación del repositorio. El mapper es el único punto de conversión entre ambos mundos.
- **Interfaces** — Controllers HTTP, DTOs con validación, objetos de respuesta planos. Los controllers delegan directamente a los handlers, sin lógica propia.

### DDD aplicado

- **Aggregate Root**: `Order` es el único punto de entrada para mutaciones. `OrderItem` nunca se accede ni modifica desde afuera del agregado.
- **Value Objects**: `OrderId`, `OrderStatus` y `Money` son tipos inmutables con igualdad por valor. `Money` rechaza valores negativos y maneja precisión decimal. `OrderStatus` encapsula las guardas de transición de estado.
- **Repository Pattern**: la interfaz `OrderRepository` vive en el dominio y usa únicamente tipos de dominio. La implementación con TypeORM se conecta mediante un token de inyección (`ORDER_REPOSITORY`), manteniendo el dominio desacoplado del ORM.

### CQRS-lite

Commands (`CreateOrder`, `PayOrder`, `CancelOrder`) y Queries (`GetOrderById`, `ListOrders`) reemplazan el patrón tradicional de Use Cases. Cada handler tiene una única responsabilidad y no contiene lógica condicional de negocio — esa lógica pertenece al dominio.

### Por qué `synchronize: false`

El `synchronize: true` de TypeORM altera silenciosamente el esquema en producción y puede causar pérdida de datos. Todos los cambios de esquema se gestionan a través de migraciones versionadas en `src/infrastructure/persistence/migrations/`.

### Por qué Fastify

Fastify se usa como adaptador HTTP porque tiene menor overhead y mejor throughput que Express, con total compatibilidad con el ecosistema de NestJS a través de `@nestjs/platform-fastify`.
