import {MaxLength, MinLength, IsString, IsEmail, IsNotEmpty} from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
    email: string;

  @IsString()
  @IsNotEmpty()
    lastName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
    password: string;

  @IsString()
  @IsNotEmpty()
    firstName: string;
}