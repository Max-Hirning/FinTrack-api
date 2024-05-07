import {IsNotEmpty, IsHexColor, IsString, IsNumber, MaxLength, MinLength, IsMongoId, IsISO4217CurrencyCode} from 'class-validator';

export class CreateCardDto {
  @IsString()
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
  @IsMongoId()
  @IsNotEmpty()
    ownerId: string;

  @IsString()
  @IsNotEmpty()
  @IsISO4217CurrencyCode()
    currency: string;
}