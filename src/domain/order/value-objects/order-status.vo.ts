export enum OrderStatusValue {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export class OrderStatus {
  private readonly _value: OrderStatusValue;

  private constructor(value: OrderStatusValue) {
    this._value = value;
  }

  static pending(): OrderStatus {
    return new OrderStatus(OrderStatusValue.PENDING);
  }

  static paid(): OrderStatus {
    return new OrderStatus(OrderStatusValue.PAID);
  }

  static cancelled(): OrderStatus {
    return new OrderStatus(OrderStatusValue.CANCELLED);
  }

  static from(value: string): OrderStatus {
    const valid = Object.values(OrderStatusValue).find((v) => v === value);
    if (!valid) {
      throw new Error(`Invalid OrderStatus: "${value}"`);
    }
    return new OrderStatus(valid);
  }

  canPay(): boolean {
    return this._value === OrderStatusValue.PENDING;
  }

  canCancel(): boolean {
    return this._value === OrderStatusValue.PENDING;
  }

  isPaid(): boolean {
    return this._value === OrderStatusValue.PAID;
  }

  isCancelled(): boolean {
    return this._value === OrderStatusValue.CANCELLED;
  }

  get value(): OrderStatusValue {
    return this._value;
  }

  equals(other: OrderStatus): boolean {
    return this._value === other._value;
  }
}
