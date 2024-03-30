import {IsNotEmpty, IsString, IsNumber, MaxLength, MinLength, IsDateString, IsMongoId} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @IsDateString()
    date: string;

  @IsString()
  @IsMongoId()
  @IsNotEmpty()
    cardId: string;

  @IsNumber()
    amount: number;

  @IsString()
  @IsMongoId()
  @IsNotEmpty()
    categoryId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
    description: string;
}