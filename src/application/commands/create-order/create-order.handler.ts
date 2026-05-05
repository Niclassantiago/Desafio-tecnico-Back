import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderCommand } from './create-order.command';
import { Order } from '../../../domain/order/order.entity';
import { OrderRepository, ORDER_REPOSITORY } from '../../../domain/order/order.repository';

@Injectable()
export class CreateOrderHandler {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
  ) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    const order = Order.create(command.customerId, command.items);
    await this.orderRepository.save(order);
    return order;
  }
}
