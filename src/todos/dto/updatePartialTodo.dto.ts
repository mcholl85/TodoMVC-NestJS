import { PartialType } from '@nestjs/mapped-types';
import UpdateTodoDto from './updateTodo.dto';

export default class UpdatePartialTodoDto extends PartialType(UpdateTodoDto) {}
