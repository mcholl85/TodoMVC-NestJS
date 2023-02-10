import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { HttpCode } from '@nestjs/common/decorators';
import { UseFilters } from '@nestjs/common/decorators/core/exception-filters.decorator';
import { Request } from 'express';
import { HttpExceptionFilter } from '../utils/http-exception.filter';
import CreateTodoDto from './dto/createtodo.dto';
import ResponseTodoDto from './dto/responseTodo.dto';
import UpdatePartialTodoDto from './dto/updatePartialTodo.dto';
import UpdateTodoDto from './dto/updateTodo.dto';
import TodosService from './todos.service';

@UseFilters(new HttpExceptionFilter())
@Controller('todos')
export default class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  async getAllTodos(@Req() req: Request): Promise<ResponseTodoDto[]> {
    const data = await this.todosService.getAllTodos();
    const response: ResponseTodoDto[] = data.map((todo) => ({
      ...todo,
      url: `${req.protocol}://${req.get('host')}${
        req.url.slice(-1) === '/' ? req.url.slice(0, -1) : req.url
      }/${todo.id}`,
    }));

    return response;
  }

  @Post()
  async createTodo(
    @Body() body: CreateTodoDto,
    @Req() req: Request,
  ): Promise<ResponseTodoDto> {
    const data = await this.todosService.createTodo(body.title);
    const response: ResponseTodoDto = {
      ...data,
      url: `${req.protocol}://${req.get('host')}${
        req.url.slice(-1) === '/' ? req.url.slice(0, -1) : req.url
      }/${data.id}`,
    };

    return response;
  }

  @Delete()
  @HttpCode(204)
  async deleteTodos(@Query('completed') completed: string) {
    completed === 'true'
      ? await this.todosService.deleteCompletedTodos()
      : await this.todosService.deleteAllTodos();
  }

  @Get(':id')
  async getTodoById(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ResponseTodoDto> {
    const data = await this.todosService.getTodoById(id);
    const response: ResponseTodoDto = {
      ...data,
      url: `${req.protocol}://${req.get('host')}${req.url}`,
    };

    return response;
  }

  @Put(':id')
  async updateTodo(
    @Param('id') id: string,
    @Body() body: UpdateTodoDto,
    @Req() req: Request,
  ): Promise<ResponseTodoDto> {
    await this.todosService.updateTodo(id, body);

    return await this.getTodoById(req, id);
  }

  @Patch(':id')
  async updatePartialTodo(
    @Param('id') id: string,
    @Body() body: UpdatePartialTodoDto,
    @Req() req: Request,
  ): Promise<ResponseTodoDto> {
    await this.todosService.updateTodo(id, body);

    return await this.getTodoById(req, id);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteTodo(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<void> {
    await this.todosService.deleteTodo(id);
  }
}
