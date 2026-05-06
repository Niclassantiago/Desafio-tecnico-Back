import 'reflect-metadata';
import { CreateOrderHandler } from '../create-order.handler';
import { CreateOrderCommand } from '../create-order.command';
import { OrderRepository } from '../../../../domain/order/order.repository';
import { OrderStatusValue } from '../../../../domain/order/value-objects/order-status.vo';

const CUSTOMER_ID = '550e8400-e29b-41d4-a716-446655440000';
const ITEMS = [
  { productId: '550e8400-e29b-41d4-a716-446655440001', name: 'Widget', price: 10, quantity: 2 },
];

function mockRepo(): jest.Mocked<OrderRepository> {
  return { save: jest.fn(), findById: jest.fn(), findAll: jest.fn() };
}

describe('CreateOrderHandler', () => {
  it('creates an order with PENDING status and saves it', async () => {
    const repo = mockRepo();
    const handler = new CreateOrderHandler(repo);
    const command = new CreateOrderCommand(CUSTOMER_ID, ITEMS);

    const order = await handler.execute(command);

    expect(order.status.value).toBe(OrderStatusValue.PENDING);
    expect(order.customerId).toBe(CUSTOMER_ID);
    expect(order.items).toHaveLength(1);
    expect(repo.save).toHaveBeenCalledWith(order);
  });
});
