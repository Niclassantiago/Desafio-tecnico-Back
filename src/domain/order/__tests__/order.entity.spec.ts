import { Order } from '../order.entity';
import { OrderAlreadyCancelledException } from '../exceptions/order-already-cancelled.exception';
import { OrderAlreadyPaidException } from '../exceptions/order-already-paid.exception';
import { OrderStatusValue } from '../value-objects/order-status.vo';
import { Money } from '../value-objects/money.vo';

const defaultItems = [
  { productId: '550e8400-e29b-41d4-a716-446655440001', name: 'Product A', price: 10.0, quantity: 2 },
  { productId: '550e8400-e29b-41d4-a716-446655440002', name: 'Product B', price: 5.5, quantity: 1 },
];

function makeOrder(): Order {
  return Order.create('550e8400-e29b-41d4-a716-446655440000', defaultItems);
}

describe('Order', () => {
  describe('Order.create()', () => {
    it('sets status to PENDING', () => {
      const order = makeOrder();
      expect(order.status.value).toBe(OrderStatusValue.PENDING);
    });

    it('calculates total correctly from item subtotals', () => {
      const order = makeOrder();
      // 10.00 * 2 + 5.50 * 1 = 25.50
      expect(order.total.value).toBe(25.5);
    });

    it('throws when created with no items', () => {
      expect(() => Order.create('550e8400-e29b-41d4-a716-446655440000', [])).toThrow(
        'Order must have at least one item',
      );
    });
  });

  describe('order.pay()', () => {
    it('sets status to PAID on a PENDING order', () => {
      const order = makeOrder();
      order.pay();
      expect(order.status.value).toBe(OrderStatusValue.PAID);
    });

    it('throws OrderAlreadyCancelledException when paying a cancelled order', () => {
      const order = makeOrder();
      order.cancel();
      expect(() => order.pay()).toThrow(OrderAlreadyCancelledException);
    });

    it('throws OrderAlreadyPaidException when paying an already paid order', () => {
      const order = makeOrder();
      order.pay();
      expect(() => order.pay()).toThrow(OrderAlreadyPaidException);
    });
  });

  describe('order.cancel()', () => {
    it('sets status to CANCELLED on a PENDING order', () => {
      const order = makeOrder();
      order.cancel();
      expect(order.status.value).toBe(OrderStatusValue.CANCELLED);
    });

    it('throws OrderAlreadyPaidException when cancelling a paid order', () => {
      const order = makeOrder();
      order.pay();
      expect(() => order.cancel()).toThrow(OrderAlreadyPaidException);
    });

    it('throws OrderAlreadyCancelledException when cancelling an already cancelled order', () => {
      const order = makeOrder();
      order.cancel();
      expect(() => order.cancel()).toThrow(OrderAlreadyCancelledException);
    });
  });
});

describe('Money', () => {
  it('rejects negative values', () => {
    expect(() => Money.of(-1)).toThrow('Money value cannot be negative');
  });

  it('allows zero', () => {
    expect(Money.zero().value).toBe(0);
  });

  it('adds two Money values correctly', () => {
    const a = Money.of(10.5);
    const b = Money.of(4.5);
    expect(a.add(b).value).toBe(15.0);
  });
});
