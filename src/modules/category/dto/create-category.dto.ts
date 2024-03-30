import {IsHexColor, IsMongoId, IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
    mcc: string;

  @IsString()
  @IsNotEmpty()
    title: string;

  @IsNotEmpty()
  @IsHexColor()
    color: string;

  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  @IsOptional()
    parentId: string;
}
