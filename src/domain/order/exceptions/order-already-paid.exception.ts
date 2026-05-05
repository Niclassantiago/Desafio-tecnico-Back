export class OrderAlreadyPaidException extends Error {
  constructor() {
    super('Order is already paid');
    this.name = 'OrderAlreadyPaidException';
  }
}
