import { Order } from '../../../domain/order/order.entity';

interface OrderItemResponse {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export class OrderResponse {
  id: string;
  customerId: string;
  status: string;
  total: number;
  items: OrderItemResponse[];
  createdAt: string;

  static fromDomain(order: Order): OrderResponse {
    const response = new OrderResponse();
    response.id = order.id.value;
    response.customerId = order.customerId;
    response.status = order.status.value;
    response.total = order.total.value;
    response.items = order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: item.price.value,
      quantity: item.quantity,
    }));
    response.createdAt = order.createdAt.toISOString();
    return response;
  }
}
