import 'reflect-metadata';
import { CancelOrderHandler } from '../cancel-order.handler';
import { CancelOrderCommand } from '../cancel-order.command';
import { OrderRepository } from '../../../../domain/order/order.repository';
import { Order } from '../../../../domain/order/order.entity';
import { OrderNotFoundException } from '../../../../domain/order/exceptions/order-not-found.exception';
import { OrderAlreadyCancelledException } from '../../../../domain/order/exceptions/order-already-cancelled.exception';
import { OrderStatusValue } from '../../../../domain/order/value-objects/order-status.vo';

function makeOrder(): Order {
  return Order.create('550e8400-e29b-41d4-a716-446655440000', [
    { productId: '550e8400-e29b-41d4-a716-446655440001', name: 'Widget', price: 10, quantity: 1 },
  ]);
}

function mockRepo(): jest.Mocked<OrderRepository> {
  return { save: jest.fn(), findById: jest.fn(), findAll: jest.fn() };
}

describe('CancelOrderHandler', () => {
  it('transitions a PENDING order to CANCELLED and saves it', async () => {
    const repo = mockRepo();
    const order = makeOrder();
    repo.findById.mockResolvedValue(order);
    const handler = new CancelOrderHandler(repo);

    const result = await handler.execute(new CancelOrderCommand(order.id.value));

    expect(result.status.value).toBe(OrderStatusValue.CANCELLED);
    expect(repo.save).toHaveBeenCalledWith(order);
  });

  it('throws OrderNotFoundException when the order does not exist', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    const handler = new CancelOrderHandler(repo);

    await expect(
      handler.execute(new CancelOrderCommand('550e8400-e29b-41d4-a716-446655440099')),
    ).rejects.toThrow(OrderNotFoundException);
  });

  it('propagates OrderAlreadyCancelledException from the domain', async () => {
    const repo = mockRepo();
    const order = makeOrder();
    order.cancel();
    repo.findById.mockResolvedValue(order);
    const handler = new CancelOrderHandler(repo);

    await expect(
      handler.execute(new CancelOrderCommand(order.id.value)),
    ).rejects.toThrow(OrderAlreadyCancelledException);
  });
});
