import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { OrderNotFoundException } from '../../../domain/order/exceptions/order-not-found.exception';
import { OrderAlreadyPaidException } from '../../../domain/order/exceptions/order-already-paid.exception';
import { OrderAlreadyCancelledException } from '../../../domain/order/exceptions/order-already-cancelled.exception';

@Catch(OrderNotFoundException, OrderAlreadyPaidException, OrderAlreadyCancelledException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    const statusMap: Record<string, number> = {
      OrderNotFoundException: HttpStatus.NOT_FOUND,
      OrderAlreadyPaidException: HttpStatus.CONFLICT,
      OrderAlreadyCancelledException: HttpStatus.CONFLICT,
    };

    const statusCode = statusMap[exception.name] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    reply.status(statusCode).send({
      statusCode,
      message: exception.message,
    });
  }
}
