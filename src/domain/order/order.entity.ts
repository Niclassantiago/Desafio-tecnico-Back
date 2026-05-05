import { OrderId } from './value-objects/order-id.vo';
import { OrderStatus } from './value-objects/order-status.vo';
import { Money } from './value-objects/money.vo';
import { OrderItem, CreateOrderItemProps } from './order-item.entity';
import { OrderAlreadyPaidException } from './exceptions/order-already-paid.exception';
import { OrderAlreadyCancelledException } from './exceptions/order-already-cancelled.exception';

export class Order {
  private readonly _id: OrderId;
  private readonly _customerId: string;
  private _status: OrderStatus;
  private readonly _items: OrderItem[];
  private _total: Money;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: OrderId,
    customerId: string,
    status: OrderStatus,
    items: OrderItem[],
    total: Money,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._id = id;
    this._customerId = customerId;
    this._status = status;
    this._items = items;
    this._total = total;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  static create(customerId: string, itemProps: CreateOrderItemProps[]): Order {
    if (itemProps.length === 0) {
      throw new Error('Order must have at least one item');
    }
    const items = itemProps.map(OrderItem.create);
    const total = items.reduce(
      (acc, item) => acc.add(item.subtotal()),
      Money.zero(),
    );
    const now = new Date();
    return new Order(
      OrderId.generate(),
      customerId,
      OrderStatus.pending(),
      items,
      total,
      now,
      now,
    );
  }

  static reconstitute(
    id: OrderId,
    customerId: string,
    status: OrderStatus,
    items: OrderItem[],
    total: Money,
    createdAt: Date,
    updatedAt: Date,
  ): Order {
    return new Order(id, customerId, status, items, total, createdAt, updatedAt);
  }

  pay(): void {
    this.assertTransitionAllowed();
    this._status = OrderStatus.paid();
    this._updatedAt = new Date();
  }

  cancel(): void {
    this.assertTransitionAllowed();
    this._status = OrderStatus.cancelled();
    this._updatedAt = new Date();
  }

  private assertTransitionAllowed(): void {
    if (this._status.isPaid()) throw new OrderAlreadyPaidException();
    if (this._status.isCancelled()) throw new OrderAlreadyCancelledException();
  }

  get id(): OrderId {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get total(): Money {
    return this._total;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
