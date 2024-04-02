import {MaxLength, MinLength, IsString, IsNotEmpty} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
    password: string;
}