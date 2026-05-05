import { validate as uuidValidate, v4 as uuidv4 } from 'uuid';

export class OrderId {
  private readonly _value: string;

  private constructor(value: string) {
    if (!uuidValidate(value)) {
      throw new Error(`Invalid OrderId: "${value}" is not a valid UUID`);
    }
    this._value = value;
  }

  static generate(): OrderId {
    return new OrderId(uuidv4());
  }

  static from(value: string): OrderId {
    return new OrderId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: OrderId): boolean {
    return this._value === other._value;
  }
}
