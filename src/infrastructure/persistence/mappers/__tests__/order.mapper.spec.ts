import 'reflect-metadata';
import { OrderMapper } from '../order.mapper';
import { Order } from '../../../../domain/order/order.entity';
import { OrderStatusValue } from '../../../../domain/order/value-objects/order-status.vo';
import { OrderOrmEntity } from '../../entities/order.orm-entity';
import { OrderItemOrmEntity } from '../../entities/order-item.orm-entity';

function makeOrmEntity(): OrderOrmEntity {
  const item = new OrderItemOrmEntity();
  item.id = '550e8400-e29b-41d4-a716-446655440010';
  item.productId = '550e8400-e29b-41d4-a716-446655440001';
  item.name = 'Widget';
  item.price = 10.5;
  item.quantity = 2;

  const orm = new OrderOrmEntity();
  orm.id = '550e8400-e29b-41d4-a716-446655440000';
  orm.customerId = '550e8400-e29b-41d4-a716-446655440099';
  orm.status = OrderStatusValue.PENDING;
  orm.total = 21.0;
  orm.createdAt = new Date('2024-01-01T00:00:00Z');
  orm.updatedAt = new Date('2024-01-02T00:00:00Z');
  orm.items = [item];

  return orm;
}

function makeDomainOrder(): Order {
  return Order.create('550e8400-e29b-41d4-a716-446655440099', [
    { productId: '550e8400-e29b-41d4-a716-446655440001', name: 'Widget', price: 10.5, quantity: 2 },
  ]);
}

describe('OrderMapper', () => {
  describe('toDomain', () => {
    it('maps scalar fields from ORM entity to domain', () => {
      const orm = makeOrmEntity();
      const domain = OrderMapper.toDomain(orm);

      expect(domain.id.value).toBe(orm.id);
      expect(domain.customerId).toBe(orm.customerId);
      expect(domain.status.value).toBe(OrderStatusValue.PENDING);
      expect(domain.total.value).toBe(21.0);
      expect(domain.createdAt).toBe(orm.createdAt);
      expect(domain.updatedAt).toBe(orm.updatedAt);
    });

    it('maps items preserving id, price, and quantity', () => {
      const orm = makeOrmEntity();
      const domain = OrderMapper.toDomain(orm);

      expect(domain.items).toHaveLength(1);
      const item = domain.items[0];
      expect(item.id).toBe('550e8400-e29b-41d4-a716-446655440010');
      expect(item.productId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(item.price.value).toBe(10.5);
      expect(item.quantity).toBe(2);
    });

    it('handles an ORM entity with null items without throwing', () => {
      const orm = makeOrmEntity();
      orm.items = null as any;
      const domain = OrderMapper.toDomain(orm);
      expect(domain.items).toHaveLength(0);
    });
  });

  describe('toOrm', () => {
    it('maps scalar fields from domain to ORM entity', () => {
      const order = makeDomainOrder();
      const orm = OrderMapper.toOrm(order);

      expect(orm.id).toBe(order.id.value);
      expect(orm.customerId).toBe(order.customerId);
      expect(orm.status).toBe(OrderStatusValue.PENDING);
      expect(orm.total).toBe(order.total.value);
    });

    it('maps items and wires the back-reference to the parent ORM entity', () => {
      const order = makeDomainOrder();
      const orm = OrderMapper.toOrm(order);

      expect(orm.items).toHaveLength(1);
      expect(orm.items[0].price).toBe(10.5);
      expect(orm.items[0].quantity).toBe(2);
      expect(orm.items[0].order).toBe(orm);
    });
  });

  describe('round-trip: domain → toOrm → toDomain', () => {
    it('preserves all fields through both conversions', () => {
      const original = makeDomainOrder();
      const orm = OrderMapper.toOrm(original);
      const restored = OrderMapper.toDomain(orm);

      expect(restored.id.value).toBe(original.id.value);
      expect(restored.customerId).toBe(original.customerId);
      expect(restored.status.value).toBe(original.status.value);
      expect(restored.total.value).toBe(original.total.value);
      expect(restored.items).toHaveLength(original.items.length);
      expect(restored.items[0].id).toBe(original.items[0].id);
      expect(restored.items[0].price.value).toBe(original.items[0].price.value);
      expect(restored.items[0].quantity).toBe(original.items[0].quantity);
    });
  });
});
