import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { OrderOrmEntity } from './src/infrastructure/persistence/entities/order.orm-entity';
import { OrderItemOrmEntity } from './src/infrastructure/persistence/entities/order-item.orm-entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [OrderOrmEntity, OrderItemOrmEntity],
  migrations: ['src/infrastructure/persistence/migrations/*.ts'],
  synchronize: false,
});
