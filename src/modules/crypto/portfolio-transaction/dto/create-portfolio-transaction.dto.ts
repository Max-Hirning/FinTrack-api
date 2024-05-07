import {IsNotEmpty, IsString, IsNumber, MaxLength, IsDateString, IsMongoId, IsOptional} from 'class-validator';

export class CreatePortfolioTransactionDto {
  @IsString()
  @IsNotEmpty()
  @IsDateString()
    date: string;

  @IsString()
  @IsMongoId()
  @IsNotEmpty()
    portfolioId: string;

  @IsNumber()
    amount: number;

  @IsNumber()
    price: number;

  @IsString()
    asset: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
    description: string;
}
