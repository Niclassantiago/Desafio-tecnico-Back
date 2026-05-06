import 'reflect-metadata';
import { GetOrderByIdHandler } from '../get-order-by-id.handler';
import { GetOrderByIdQuery } from '../get-order-by-id.query';
import { OrderRepository } from '../../../../domain/order/order.repository';
import { Order } from '../../../../domain/order/order.entity';
import { OrderNotFoundException } from '../../../../domain/order/exceptions/order-not-found.exception';

function makeOrder(): Order {
  return Order.create('550e8400-e29b-41d4-a716-446655440000', [
    { productId: '550e8400-e29b-41d4-a716-446655440001', name: 'Widget', price: 10, quantity: 1 },
  ]);
}

function mockRepo(): jest.Mocked<OrderRepository> {
  return { save: jest.fn(), findById: jest.fn(), findAll: jest.fn() };
}

describe('GetOrderByIdHandler', () => {
  it('returns the order when found', async () => {
    const repo = mockRepo();
    const order = makeOrder();
    repo.findById.mockResolvedValue(order);
    const handler = new GetOrderByIdHandler(repo);

    const result = await handler.execute(new GetOrderByIdQuery(order.id.value));

    expect(result).toBe(order);
  });

  it('throws OrderNotFoundException when the order does not exist', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    const handler = new GetOrderByIdHandler(repo);

    await expect(
      handler.execute(new GetOrderByIdQuery('550e8400-e29b-41d4-a716-446655440099')),
    ).rejects.toThrow(OrderNotFoundException);
  });
});
