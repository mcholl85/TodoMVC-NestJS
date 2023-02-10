import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import OrderAlreadyTakenError from '../todos/exceptions/orderAlreadyTaken.exception';
import TodoNotFoundError from '../todos/exceptions/todoNotFound.exception';

@Catch(OrderAlreadyTakenError, TodoNotFoundError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    exception: OrderAlreadyTakenError | TodoNotFoundError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.status).json({
      statusCode: exception.status,
      message: exception.message,
    });
  }
}
