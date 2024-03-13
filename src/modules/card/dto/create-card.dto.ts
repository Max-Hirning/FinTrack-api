import {IsNotEmpty, IsHexColor, IsString, IsNumber, IsOptional, MaxLength, MinLength, IsFirebasePushId} from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsHexColor()
    color: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
    title: string;

  @IsNumber()
    balance: number;

  @IsString()
  @IsNotEmpty()
  @IsFirebasePushId()
    ownerId: string;

  @IsString()
  @IsNotEmpty()
    currency: string;
}