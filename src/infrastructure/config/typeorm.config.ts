import { DataSourceOptions } from 'typeorm';
import { OrderOrmEntity } from '../persistence/entities/order.orm-entity';
import { OrderItemOrmEntity } from '../persistence/entities/order-item.orm-entity';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [OrderOrmEntity, OrderItemOrmEntity],
  migrations: ['dist/infrastructure/persistence/migrations/*.js'],
  synchronize: false,
};
