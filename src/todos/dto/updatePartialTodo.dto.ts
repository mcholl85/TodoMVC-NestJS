import { PartialType } from '@nestjs/swagger';
import UpdateTodoDto from './updateTodo.dto';

export default class UpdatePartialTodoDto extends PartialType(UpdateTodoDto) {}
