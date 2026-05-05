# Orders API

REST API for purchase order management built with NestJS + Fastify, applying DDD, Hexagonal Architecture, and CQRS-lite.

**Author:** Niclas Avellaneda

## Prerequisites

- Node.js 20+
- Docker and Docker Compose

## Setup

```bash
# 1. Clone the repository and enter the directory
git clone https://github.com/Niclassantiago/Desafio-tecnico-Back.git
cd orders-api

# 2. Create the environment file
cp .env.example .env
# Fill in the values in .env (see Environment Variables below)

# 3. Start the PostgreSQL database
docker-compose up -d

# 4. Install dependencies
npm install

# 5. Run migrations
npm run migration:run

# 6. Start the application
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## Environment Variables

| Variable      | Description              | Example       |
|---------------|--------------------------|---------------|
| `DB_HOST`     | PostgreSQL host          | `localhost`   |
| `DB_PORT`     | PostgreSQL port          | `5432`        |
| `DB_USER`     | PostgreSQL username      | `orders_user` |
| `DB_PASSWORD` | PostgreSQL password      | `orders_pass` |
| `DB_NAME`     | PostgreSQL database name | `orders_db`   |
| `PORT`        | HTTP port for the API    | `3000`        |

## Running Migrations

```bash
# Apply all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Generate a new migration based on entity changes
npm run migration:generate -- src/infrastructure/persistence/migrations/<MigrationName>
```

## Running Tests

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov
```

## Endpoints

| Method | Path                 | Description               |
|--------|----------------------|---------------------------|
| POST   | `/orders`            | Create a new order        |
| GET    | `/orders`            | List all orders           |
| GET    | `/orders/:id`        | Get an order by ID        |
| POST   | `/orders/:id/pay`    | Mark an order as PAID     |
| POST   | `/orders/:id/cancel` | Mark an order as CANCELLED|

See `postman_collection.json` for full request/response examples.

---

## Technical Decisions

### Hexagonal Architecture

The codebase is split into four layers with strict dependency direction (inward only):

- **Domain** — pure TypeScript: Entities, Value Objects, Aggregate Root, Repository interface. Zero external dependencies.
- **Application** — orchestration via Commands and Queries. Handlers load from repository, call domain methods, persist, return. No business logic lives here.
- **Infrastructure** — TypeORM ORM entities, explicit domain↔ORM mappers, repository implementation. The mapper is the only place where conversion happens, keeping both sides independently evolvable.
- **Interfaces** — HTTP controllers, DTOs with validation, plain response objects. Controllers delegate directly to handlers; no logic lives here.

### DDD Concepts Applied

- **Aggregate Root**: `Order` is the only entry point for mutations. `OrderItem` is never accessed or modified from outside the aggregate.
- **Value Objects**: `OrderId`, `OrderStatus`, and `Money` are immutable, equality-by-value types. `Money` prevents negative values and handles floating-point precision via rounding. `OrderStatus` encapsulates transition guards.
- **Repository Pattern**: `OrderRepository` interface lives in the domain layer and uses domain types exclusively. The TypeORM implementation is wired via a DI token (`ORDER_REPOSITORY`), keeping the domain decoupled from the ORM.

### CQRS-lite

Commands (`CreateOrder`, `PayOrder`, `CancelOrder`) and Queries (`GetOrderById`, `ListOrders`) replace a traditional Use Case pattern. Each handler has one responsibility and contains no conditional business logic — that belongs to the domain.

### Why `synchronize: false`

TypeORM's `synchronize: true` silently alters production schemas and causes data loss. All schema changes are managed through explicit versioned migrations in `src/infrastructure/persistence/migrations/`.

### Why Fastify

Fastify is used as the HTTP adapter because it has lower overhead and better throughput compared to Express, with full NestJS compatibility via `@nestjs/platform-fastify`.
