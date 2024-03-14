import {IsNotEmpty, IsString, IsNumber, IsFirebasePushId, MaxLength, MinLength, IsDateString} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @IsDateString()
    date: string;

  @IsString()
  @IsNotEmpty()
  @IsFirebasePushId()
    cardId: string;

  @IsNumber()
    amount: number;

  @IsString()
  @IsNotEmpty()
  @IsFirebasePushId()
    categoryId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
    description: string;
}