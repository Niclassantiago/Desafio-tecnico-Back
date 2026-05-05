import { Inject, Injectable } from '@nestjs/common';
import { GetOrderByIdQuery } from './get-order-by-id.query';
import { Order } from '../../../domain/order/order.entity';
import { OrderRepository, ORDER_REPOSITORY } from '../../../domain/order/order.repository';
import { OrderId } from '../../../domain/order/value-objects/order-id.vo';
import { OrderNotFoundException } from '../../../domain/order/exceptions/order-not-found.exception';

@Injectable()
export class GetOrderByIdHandler {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
  ) {}

  async execute(query: GetOrderByIdQuery): Promise<Order> {
    const id = OrderId.from(query.orderId);
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundException(query.orderId);
    }
    return order;
  }
}
