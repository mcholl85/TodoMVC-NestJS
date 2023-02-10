import { HttpStatus } from '@nestjs/common';

export default class TodoNotFoundError extends Error {
  status: number;

  constructor(todoId: string) {
    super(`Todo with id ${todoId} not found`);
    this.status = HttpStatus.NOT_FOUND;
  }
}
