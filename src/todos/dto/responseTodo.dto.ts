import { IsUrl, IsUUID } from 'class-validator';
import UpdateTodoDto from './updateTodo.dto';
export default class ResponseTodoDto extends UpdateTodoDto {
  @IsUUID()
  id: string;

  @IsUrl()
  url: string;
}
