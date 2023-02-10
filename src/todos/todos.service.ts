import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import UpdatePartialTodoDto from './dto/updatePartialTodo.dto';
import UpdateTodoDto from './dto/updateTodo.dto';
import OrderAlreadyTakenError from './exceptions/orderAlreadyTaken.exception';
import TodoNotFoundError from './exceptions/todoNotFound.exception';
import Todo from './todos.entity';

@Injectable()
export default class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todosRepository: Repository<Todo>,
  ) {}

  async getAllTodos() {
    return await this.todosRepository.find({ order: { order: 'ASC' } });
  }

  async createTodo(title: string) {
    const { max: maxValueFromOrder } = await this.todosRepository
      .createQueryBuilder()
      .select('MAX(Todo.order)', 'max')
      .getRawOne();
    const newTodo = this.todosRepository.create({
      id: uuidv4(),
      title: title,
      completed: false,
      order: maxValueFromOrder + 1,
    });

    await this.todosRepository.save(newTodo);
    return newTodo;
  }

  async deleteAllTodos() {
    await this.todosRepository.clear();
  }

  async deleteCompletedTodos() {
    const completedTodos = await this.todosRepository.find({
      where: {
        completed: true,
      },
    });

    await this.todosRepository.remove(completedTodos);
  }

  async getTodoById(id: string) {
    const todo = await this.todosRepository.findOneBy({ id: id });

    if (!todo) {
      throw new TodoNotFoundError(id);
    }

    return todo;
  }

  async updateTodo(id: string, body: UpdatePartialTodoDto | UpdateTodoDto) {
    const todoWithSameOrder = body.order
      ? await this.todosRepository.findOne({
          where: {
            order: body.order,
            id: Not(id),
          },
        })
      : null;

    if (todoWithSameOrder) {
      throw new OrderAlreadyTakenError(body.order);
    }

    await this.todosRepository.update(id, body);
  }

  async deleteTodo(id: string) {
    const deleteResult = await this.todosRepository.delete(id);

    if (!deleteResult.affected) {
      throw new TodoNotFoundError(id);
    }
  }
}
