import {IsNotEmpty, IsHexColor, IsString, MaxLength, MinLength, IsMongoId} from 'class-validator';

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  @IsHexColor()
    color: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
    title: string;

  @IsString()
  @IsMongoId()
  @IsNotEmpty()
    ownerId: string;
}
