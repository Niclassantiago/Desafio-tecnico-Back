import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderOrmEntity } from './infrastructure/persistence/entities/order.orm-entity';
import { OrderItemOrmEntity } from './infrastructure/persistence/entities/order-item.orm-entity';
import { TypeOrmOrderRepository } from './infrastructure/persistence/repositories/typeorm-order.repository';
import { ORDER_REPOSITORY } from './domain/order/order.repository';
import { CreateOrderHandler } from './application/commands/create-order/create-order.handler';
import { PayOrderHandler } from './application/commands/pay-order/pay-order.handler';
import { CancelOrderHandler } from './application/commands/cancel-order/cancel-order.handler';
import { GetOrderByIdHandler } from './application/queries/get-order-by-id/get-order-by-id.handler';
import { ListOrdersHandler } from './application/queries/list-orders/list-orders.handler';
import { OrdersController } from './interfaces/http/orders.controller';

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
