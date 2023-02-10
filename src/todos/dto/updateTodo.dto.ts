import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class UpdateTodoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  @IsNotEmpty()
  completed: boolean;

  @IsNumber()
  @IsNotEmpty()
  order: number;
}
