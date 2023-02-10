import { IsNotEmpty, IsString } from 'class-validator';

export default class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
