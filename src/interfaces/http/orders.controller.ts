import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateOrderHandler } from '../../application/commands/create-order/create-order.handler';
import { PayOrderHandler } from '../../application/commands/pay-order/pay-order.handler';
import { CancelOrderHandler } from '../../application/commands/cancel-order/cancel-order.handler';
import { GetOrderByIdHandler } from '../../application/queries/get-order-by-id/get-order-by-id.handler';
import { ListOrdersHandler } from '../../application/queries/list-orders/list-orders.handler';
import { CreateOrderCommand } from '../../application/commands/create-order/create-order.command';
import { PayOrderCommand } from '../../application/commands/pay-order/pay-order.command';
import { CancelOrderCommand } from '../../application/commands/cancel-order/cancel-order.command';
import { GetOrderByIdQuery } from '../../application/queries/get-order-by-id/get-order-by-id.query';
import { ListOrdersQuery } from '../../application/queries/list-orders/list-orders.query';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderResponse } from './responses/order.response';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderHandler: CreateOrderHandler,
    private readonly payOrderHandler: PayOrderHandler,
    private readonly cancelOrderHandler: CancelOrderHandler,
    private readonly getOrderByIdHandler: GetOrderByIdHandler,
    private readonly listOrdersHandler: ListOrdersHandler,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponse> {
    const command = new CreateOrderCommand(dto.customerId, dto.items);
    const order = await this.createOrderHandler.execute(command);
    return OrderResponse.fromDomain(order);
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<OrderResponse> {
    const query = new GetOrderByIdQuery(id);
    const order = await this.getOrderByIdHandler.execute(query);
    return OrderResponse.fromDomain(order);
  }

  @Get()
  async list(): Promise<OrderResponse[]> {
    const query = new ListOrdersQuery();
    const orders = await this.listOrdersHandler.execute(query);
    return orders.map(OrderResponse.fromDomain);
  }

  @Post(':id/pay')
  @HttpCode(200)
  async pay(@Param('id', ParseUUIDPipe) id: string): Promise<OrderResponse> {
    const command = new PayOrderCommand(id);
    const order = await this.payOrderHandler.execute(command);
    return OrderResponse.fromDomain(order);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  async cancel(@Param('id', ParseUUIDPipe) id: string): Promise<OrderResponse> {
    const command = new CancelOrderCommand(id);
    const order = await this.cancelOrderHandler.execute(command);
    return OrderResponse.fromDomain(order);
  }
}
