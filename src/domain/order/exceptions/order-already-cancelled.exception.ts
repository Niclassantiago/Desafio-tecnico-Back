export class OrderAlreadyCancelledException extends Error {
  constructor() {
    super('Order is already cancelled');
    this.name = 'OrderAlreadyCancelledException';
  }
}
