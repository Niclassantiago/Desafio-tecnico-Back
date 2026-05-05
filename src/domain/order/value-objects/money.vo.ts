export class Money {
  private readonly _value: number;

  private constructor(value: number) {
    if (value < 0) {
      throw new Error(`Money value cannot be negative: ${value}`);
    }
    this._value = Math.round(value * 100) / 100;
  }

  static of(value: number): Money {
    return new Money(value);
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return new Money(this._value + other._value);
  }

  get value(): number {
    return this._value;
  }

  equals(other: Money): boolean {
    return this._value === other._value;
  }
}
