import {IsString, IsNotEmpty, IsMongoId} from 'class-validator';

export class ContactUsDto {
  @IsString()
  @IsNotEmpty()
    title: string;

  @IsString()
  @IsMongoId()
  @IsNotEmpty()
    userId: string;

  @IsString()
  @IsNotEmpty()
    text: string;
}