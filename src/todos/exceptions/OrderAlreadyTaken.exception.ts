import { HttpStatus } from '@nestjs/common';

export default class OrderAlreadyTakenError extends Error {
  status: number;

  constructor(order: number) {
    super(`Order ${order} is already taken`);
    this.status = HttpStatus.CONFLICT;
  }
}
