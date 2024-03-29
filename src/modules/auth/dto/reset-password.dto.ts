import {MaxLength, MinLength, IsString, IsNotEmpty, IsJWT} from 'class-validator';

export class ResetPasswordDto {
  @IsJWT()
  @IsString()
  @IsNotEmpty()
    code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
    password: string;
}