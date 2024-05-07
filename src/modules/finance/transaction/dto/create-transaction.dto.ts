import {IsNotEmpty, IsString, IsNumber, MaxLength, IsDateString, IsMongoId, IsOptional} from 'class-validator';

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
  @IsOptional()
  @MaxLength(200)
    description: string;
}