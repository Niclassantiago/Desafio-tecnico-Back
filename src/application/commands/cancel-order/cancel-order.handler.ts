import { Inject, Injectable } from '@nestjs/common';
import { CancelOrderCommand } from './cancel-order.command';
import { Order } from '../../../domain/order/order.entity';
import { OrderRepository, ORDER_REPOSITORY } from '../../../domain/order/order.repository';
import { OrderId } from '../../../domain/order/value-objects/order-id.vo';
import { OrderNotFoundException } from '../../../domain/order/exceptions/order-not-found.exception';

@Injectable()
export class CancelOrderHandler {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
  ) {}

  async execute(command: CancelOrderCommand): Promise<Order> {
    const id = OrderId.from(command.orderId);
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundException(command.orderId);
    }
    order.cancel();
    await this.orderRepository.save(order);
    return order;
  }
}
