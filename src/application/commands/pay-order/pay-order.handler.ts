import { Inject, Injectable } from '@nestjs/common';
import { PayOrderCommand } from './pay-order.command';
import { Order } from '../../../domain/order/order.entity';
import { OrderRepository, ORDER_REPOSITORY } from '../../../domain/order/order.repository';
import { OrderId } from '../../../domain/order/value-objects/order-id.vo';
import { OrderNotFoundException } from '../../../domain/order/exceptions/order-not-found.exception';

@Injectable()
export class PayOrderHandler {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
  ) {}

  async execute(command: PayOrderCommand): Promise<Order> {
    const id = OrderId.from(command.orderId);
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundException(command.orderId);
    }
    order.pay();
    await this.orderRepository.save(order);
    return order;
  }
}
