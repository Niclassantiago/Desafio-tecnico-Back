import { Money } from './value-objects/money.vo';
import { v4 as uuidv4 } from 'uuid';

export interface CreateOrderItemProps {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export class OrderItem {
  private readonly _id: string;
  private readonly _productId: string;
  private readonly _name: string;
  private readonly _price: Money;
  private readonly _quantity: number;

  private constructor(
    id: string,
    productId: string,
    name: string,
    price: Money,
    quantity: number,
  ) {
    this._id = id;
    this._productId = productId;
    this._name = name;
    this._price = price;
    this._quantity = quantity;
  }

  static create(props: CreateOrderItemProps): OrderItem {
    if (props.quantity < 1) {
      throw new Error('OrderItem quantity must be at least 1');
    }
    return new OrderItem(
      uuidv4(),
      props.productId,
      props.name,
      Money.of(props.price),
      props.quantity,
    );
  }

  static reconstitute(
    id: string,
    productId: string,
    name: string,
    price: number,
    quantity: number,
  ): OrderItem {
    return new OrderItem(id, productId, name, Money.of(price), quantity);
  }

  subtotal(): Money {
    return Money.of(this._price.value * this._quantity);
  }

  get id(): string {
    return this._id;
  }

  get productId(): string {
    return this._productId;
  }

  get name(): string {
    return this._name;
  }

  get price(): Money {
    return this._price;
  }

  get quantity(): number {
    return this._quantity;
  }
}
