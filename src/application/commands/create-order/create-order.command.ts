export class CreateOrderCommand {
  constructor(
    public readonly customerId: string,
    public readonly items: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }[],
  ) {}
}
