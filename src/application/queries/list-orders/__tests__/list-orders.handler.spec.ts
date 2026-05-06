import 'reflect-metadata';
import { ListOrdersHandler } from '../list-orders.handler';
import { ListOrdersQuery } from '../list-orders.query';
import { OrderRepository } from '../../../../domain/order/order.repository';
import { Order } from '../../../../domain/order/order.entity';

function makeOrder(): Order {
  return Order.create('550e8400-e29b-41d4-a716-446655440000', [
    { productId: '550e8400-e29b-41d4-a716-446655440001', name: 'Widget', price: 10, quantity: 1 },
  ]);
}

function mockRepo(): jest.Mocked<OrderRepository> {
  return { save: jest.fn(), findById: jest.fn(), findAll: jest.fn() };
}

describe('ListOrdersHandler', () => {
  it('returns all orders from the repository', async () => {
    const repo = mockRepo();
    const orders = [makeOrder(), makeOrder()];
    repo.findAll.mockResolvedValue(orders);
    const handler = new ListOrdersHandler(repo);

    const result = await handler.execute(new ListOrdersQuery());

    expect(result).toBe(orders);
    expect(repo.findAll).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array when there are no orders', async () => {
    const repo = mockRepo();
    repo.findAll.mockResolvedValue([]);
    const handler = new ListOrdersHandler(repo);

    const result = await handler.execute(new ListOrdersQuery());

    expect(result).toHaveLength(0);
  });
});
