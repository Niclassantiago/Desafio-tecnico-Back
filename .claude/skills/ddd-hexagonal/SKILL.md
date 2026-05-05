---
name: ddd-hexagonal
description: Enforces clean backend architecture for a NestJS + Fastify technical challenge using DDD, Hexagonal Architecture, and CQRS-lite. Prioritizes a pure domain model, strict layer separation, Value Objects, and correct responsibility boundaries while avoiding unnecessary complexity or overengineering. Designed to produce a clear, maintainable, and evaluation-ready solution including all delivery artifacts.
---

You are a senior backend engineer building a technical challenge. Read every rule in this skill before writing a single line of code. Architecture and design decisions are fixed — do not deviate.

---

## Stack

- NestJS with Fastify adapter (`@nestjs/platform-fastify`)
- PostgreSQL + TypeORM
- Migrations mandatory — `synchronize: false` always
- Jest for unit tests
- Docker Compose for local DB

---

## Project Structure

Enforce this layout exactly. Do not deviate:

```
src/
├── domain/
│   └── order/
│       ├── order.entity.ts          # Aggregate Root
│       ├── order-item.entity.ts     # Part of aggregate
│       ├── order.repository.ts      # Interface (port)
│       ├── exceptions/
│       │   ├── order-not-found.exception.ts
│       │   ├── order-already-paid.exception.ts
│       │   └── order-already-cancelled.exception.ts
│       └── value-objects/
│           ├── order-id.vo.ts
│           ├── order-status.vo.ts
│           └── money.vo.ts
├── application/
│   ├── commands/
│   │   ├── create-order/
│   │   │   ├── create-order.command.ts
│   │   │   └── create-order.handler.ts
│   │   ├── pay-order/
│   │   │   ├── pay-order.command.ts
│   │   │   └── pay-order.handler.ts
│   │   └── cancel-order/
│   │       ├── cancel-order.command.ts
│   │       └── cancel-order.handler.ts
│   └── queries/
│       ├── get-order-by-id/
│       │   ├── get-order-by-id.query.ts
│       │   └── get-order-by-id.handler.ts
│       └── list-orders/
│           ├── list-orders.query.ts
│           └── list-orders.handler.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── entities/
│   │   │   ├── order.orm-entity.ts
│   │   │   └── order-item.orm-entity.ts
│   │   ├── mappers/
│   │   │   └── order.mapper.ts
│   │   ├── repositories/
│   │   │   └── typeorm-order.repository.ts
│   │   └── migrations/
│   └── config/
│       └── typeorm.config.ts
├── interfaces/
│   └── http/
│       ├── orders.controller.ts
│       ├── dtos/
│       │   ├── create-order.dto.ts
│       │   └── order-item.dto.ts
│       ├── responses/
│       │   └── order.response.ts
│       └── filters/
│           └── domain-exception.filter.ts
├── orders.module.ts
└── app.module.ts
```

---

## Packages to Install

```bash
npm install @nestjs/platform-fastify fastify
npm install @nestjs/typeorm typeorm pg
npm install class-validator class-transformer
npm install uuid
npm install --save-dev @types/uuid
```

---

## API Contract

### POST /orders

**Request body:**
```json
{
  "customerId": "uuid-string",
  "items": [
    { "productId": "uuid-string", "name": "Product A", "price": 29.99, "quantity": 2 },
    { "productId": "uuid-string", "name": "Product B", "price": 10.00, "quantity": 1 }
  ]
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "customerId": "uuid",
  "status": "PENDING",
  "total": 69.98,
  "items": [
    { "id": "uuid", "productId": "uuid", "name": "Product A", "price": 29.99, "quantity": 2 }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /orders/:id

**Response 200:** same shape as above  
**Response 404:** `{ "statusCode": 404, "message": "Order not found" }`

### GET /orders

**Response 200:**
```json
[
  { ...same shape as single order... }
]
```

### POST /orders/:id/pay

**No request body.**  
**Response 200:** updated order with `"status": "PAID"`  
**Response 409:** `{ "statusCode": 409, "message": "Order is already cancelled" }`  
**Response 404:** `{ "statusCode": 404, "message": "Order not found" }`

### POST /orders/:id/cancel

**No request body.**  
**Response 200:** updated order with `"status": "CANCELLED"`  
**Response 409:** `{ "statusCode": 409, "message": "Order is already paid" }`  
**Response 404:** `{ "statusCode": 404, "message": "Order not found" }`

---

## Database Schema

### Table: `orders`

| Column       | Type                          | Notes              |
|--------------|-------------------------------|--------------------|
| id           | uuid, PK                      |                    |
| customer_id  | uuid, NOT NULL                |                    |
| status       | varchar(20), NOT NULL         | PENDING/PAID/CANCELLED |
| total        | decimal(10,2), NOT NULL       |                    |
| created_at   | timestamp, NOT NULL, default NOW() |               |
| updated_at   | timestamp, NOT NULL, default NOW() |               |

### Table: `order_items`

| Column      | Type              | Notes                       |
|-------------|-------------------|-----------------------------|
| id          | uuid, PK          |                             |
| order_id    | uuid, FK → orders |                             |
| product_id  | uuid, NOT NULL    |                             |
| name        | varchar(255), NOT NULL |                        |
| price       | decimal(10,2), NOT NULL |                       |
| quantity    | int, NOT NULL     |                             |

---

## Domain Layer Rules

### Domain is completely pure

- Zero NestJS decorators
- Zero TypeORM imports
- Zero external library imports
- Only plain TypeScript and business logic

### Value Objects

**`OrderId`** — wraps UUID string, validates format on construction.

**`OrderStatus`** — enum-backed VO:
```typescript
enum OrderStatusValue { PENDING = 'PENDING', PAID = 'PAID', CANCELLED = 'CANCELLED' }
```
Contains transition guard methods: `canPay(): boolean`, `canCancel(): boolean`.

**`Money`** — wraps number, rejects negative values on construction, provides `add(other: Money): Money` for total calculation.

All VOs are immutable. Equality is by value, not reference. Expose `.value` getter.

### Aggregate Root: `Order`

```typescript
class Order {
  private constructor(
    private readonly _id: OrderId,
    private readonly _customerId: string,
    private _status: OrderStatus,
    private readonly _items: OrderItem[],
    private _total: Money,
    private readonly _createdAt: Date,
  ) {}

  static create(customerId: string, items: CreateOrderItemProps[]): Order { ... }
  pay(): void { ... }      // throws OrderAlreadyCancelledException
  cancel(): void { ... }   // throws OrderAlreadyPaidException

  get id(): OrderId { ... }
  get customerId(): string { ... }
  get status(): OrderStatus { ... }
  get items(): OrderItem[] { ... }
  get total(): Money { ... }
  get createdAt(): Date { ... }
}
```

- `Order.create()` calculates total from items automatically
- All mutations through methods only — no public setters
- `OrderItem` is never exposed directly from outside the aggregate

### Business Rules (must live in domain)

1. `order.pay()` → if status is CANCELLED, throw `OrderAlreadyCancelledException`
2. `order.cancel()` → if status is PAID, throw `OrderAlreadyPaidException`
3. Total = sum of `(price × quantity)` per item, calculated via `Money.add()`
4. `Order.create()` always sets status to `PENDING`

### Repository Interface (in domain)

```typescript
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findAll(): Promise<Order[]>;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
```

---

## Application Layer Rules

- Commands and Queries only — no Use Case classes
- Handlers contain NO business logic
- Handler pattern: load → call domain method → persist → return

### Command shape example

```typescript
// create-order.command.ts
export class CreateOrderCommand {
  constructor(
    public readonly customerId: string,
    public readonly items: { productId: string; name: string; price: number; quantity: number }[],
  ) {}
}

// create-order.handler.ts
@Injectable()
export class CreateOrderHandler {
  constructor(@Inject(ORDER_REPOSITORY) private readonly repo: OrderRepository) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    const order = Order.create(command.customerId, command.items);
    await this.repo.save(order);
    return order;
  }
}
```

Handlers for `PayOrderHandler` and `CancelOrderHandler`:
1. `findById` — throw `OrderNotFoundException` if null
2. Call `order.pay()` or `order.cancel()`
3. `save(order)`
4. Return order

Query handlers simply delegate to repository — no domain mutations.

---

## Infrastructure Layer Rules

### ORM Entities

Live in `infrastructure/persistence/entities/`. Use TypeORM decorators here.  
`OrderOrmEntity` has a `@OneToMany` relation to `OrderItemOrmEntity`.  
`OrderItemOrmEntity` has a `@ManyToOne` relation back to `OrderOrmEntity`.

### Mapper

`OrderMapper` has two static methods:

```typescript
class OrderMapper {
  static toDomain(orm: OrderOrmEntity): Order { ... }
  static toOrm(domain: Order): OrderOrmEntity { ... }
}
```

The mapper is the ONLY place where domain ↔ ORM conversion happens.

### TypeORM Repository Implementation

```typescript
@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly ormRepo: Repository<OrderOrmEntity>,
  ) {}

  async save(order: Order): Promise<void> {
    const ormEntity = OrderMapper.toOrm(order);
    await this.ormRepo.save(ormEntity);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const orm = await this.ormRepo.findOne({
      where: { id: id.value },
      relations: ['items'],
    });
    return orm ? OrderMapper.toDomain(orm) : null;
  }

  async findAll(): Promise<Order[]> {
    const orms = await this.ormRepo.find({ relations: ['items'] });
    return orms.map(OrderMapper.toDomain);
  }
}
```

### TypeORM Config

```typescript
// typeorm.config.ts — used for both app and CLI migrations
export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [OrderOrmEntity, OrderItemOrmEntity],
  migrations: ['dist/infrastructure/persistence/migrations/*.js'],
  synchronize: false,
};
```

Export a `DataSource` from `data-source.ts` at project root for the TypeORM CLI.

---

## Interfaces Layer Rules

### DTOs

Use `class-validator` decorators on DTOs. Never put business rules in DTOs.

```typescript
// create-order.dto.ts
export class OrderItemDto {
  @IsUUID() productId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() @Min(0.01) price: number;
  @IsInt() @Min(1) quantity: number;
}

export class CreateOrderDto {
  @IsUUID() customerId: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
```

### Response Object

Map domain entity to a plain response object — never return domain or ORM entities:

```typescript
// order.response.ts
export class OrderResponse {
  static fromDomain(order: Order): OrderResponse { ... }
}
```

### Exception Filter

Create a `DomainExceptionFilter` that catches domain exceptions and maps them:

| Domain Exception              | HTTP Status | Message                       |
|-------------------------------|-------------|-------------------------------|
| `OrderNotFoundException`      | 404         | "Order not found"             |
| `OrderAlreadyPaidException`   | 409         | "Order is already paid"       |
| `OrderAlreadyCancelledException` | 409      | "Order is already cancelled"  |

Apply filter globally in `main.ts`.

### Controller

```typescript
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderHandler: CreateOrderHandler,
    private readonly payOrderHandler: PayOrderHandler,
    private readonly cancelOrderHandler: CancelOrderHandler,
    private readonly getOrderByIdHandler: GetOrderByIdHandler,
    private readonly listOrdersHandler: ListOrdersHandler,
  ) {}

  @Post() @HttpCode(201) create(@Body() dto: CreateOrderDto) { ... }
  @Get(':id') getById(@Param('id') id: string) { ... }
  @Get() list() { ... }
  @Post(':id/pay') @HttpCode(200) pay(@Param('id') id: string) { ... }
  @Post(':id/cancel') @HttpCode(200) cancel(@Param('id') id: string) { ... }
}
```

---

## NestJS Module Wiring

```typescript
// orders.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([OrderOrmEntity, OrderItemOrmEntity])],
  controllers: [OrdersController],
  providers: [
    { provide: ORDER_REPOSITORY, useClass: TypeOrmOrderRepository },
    CreateOrderHandler,
    PayOrderHandler,
    CancelOrderHandler,
    GetOrderByIdHandler,
    ListOrdersHandler,
  ],
})
export class OrdersModule {}
```

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => typeOrmConfig,
    }),
    OrdersModule,
  ],
})
export class AppModule {}
```

---

## main.ts Bootstrap

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new DomainExceptionFilter());
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
```

---

## Environment Variables

`.env.example` must contain exactly these keys (no values):

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=
```

---

## Docker Compose

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

---

## Migrations

- Generate: `npx typeorm migration:generate -d data-source.ts src/infrastructure/persistence/migrations/CreateOrdersTables`
- Run: `npx typeorm migration:run -d data-source.ts`
- Add scripts to `package.json`: `"migration:run"` and `"migration:generate"`
- Never use `synchronize: true`

---

## Unit Tests

Location: `src/domain/order/__tests__/order.entity.spec.ts`

Required test cases — no mocks needed, instantiate domain objects directly:

1. `Order.create()` sets status to `PENDING`
2. `order.pay()` on a CANCELLED order throws `OrderAlreadyCancelledException`
3. `order.cancel()` on a PAID order throws `OrderAlreadyPaidException`
4. Total is correctly calculated from items (price × quantity, summed)
5. `Money` rejects negative values on construction
6. `order.pay()` on a PENDING order succeeds and sets status to `PAID`
7. `order.cancel()` on a PENDING order succeeds and sets status to `CANCELLED`

---

## Postman Collection

File: `postman_collection.json` at project root.

Must cover all 5 endpoints with:
- Happy path request/response examples
- Error cases: 404 and 409 for pay/cancel
- Use `{{baseUrl}}` variable (default: `http://localhost:3000`)

---

## README Required Sections

1. **Prerequisites** — Node version, Docker
2. **Setup** — `cp .env.example .env`, `docker-compose up -d`, `npm install`
3. **Run migrations** — exact command
4. **Start app** — `npm run start:dev`
5. **Run tests** — `npm run test`
6. **Technical Decisions** — explain: why hexagonal, why CQRS-lite, why mappers, why VOs

---

## Hard Rules — Never Violate

- Domain layer has zero imports from NestJS, TypeORM, or any external package
- ORM entities never reach the application or domain layer
- Business logic (pay/cancel guards, total calculation) lives only in domain
- Handlers do not contain `if` statements for business validation
- `synchronize: false` always in TypeORM config
- No `any` types
- Controllers return `OrderResponse`, never `Order` or ORM entities
- Exception filter handles all domain-to-HTTP mapping — controllers do not catch domain exceptions

---

## Delivery Checklist

Before marking the project complete, verify every item:

- [ ] `docker-compose.yml` starts PostgreSQL with env vars
- [ ] `.env.example` with all required keys, no values
- [ ] Migrations in `src/infrastructure/persistence/migrations/`
- [ ] `data-source.ts` at root for TypeORM CLI
- [ ] `README.md` with all 6 required sections
- [ ] `postman_collection.json` at root
- [ ] All 7 unit tests pass (`npm run test`)
- [ ] App starts and all 5 endpoints respond correctly
- [ ] No `synchronize: true` anywhere
- [ ] Domain has zero external imports
