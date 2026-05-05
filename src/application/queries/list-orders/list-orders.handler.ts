import { Inject, Injectable } from '@nestjs/common';
import { ListOrdersQuery } from './list-orders.query';
import { Order } from '../../../domain/order/order.entity';
import { OrderRepository, ORDER_REPOSITORY } from '../../../domain/order/order.repository';

@Injectable()
export class ListOrdersHandler {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
  ) {}

  async execute(_query: ListOrdersQuery): Promise<Order[]> {
    return this.orderRepository.findAll();
  }
}
