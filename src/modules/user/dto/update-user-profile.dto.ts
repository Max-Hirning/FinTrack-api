import {SignUpDto} from '@authModule/dto/sign-up.dto';
import {OmitType, PartialType} from '@nestjs/mapped-types';
import {IsNotEmpty, IsString, IsOptional} from 'class-validator';

export class UpdateUserProfileDto extends PartialType(OmitType(SignUpDto, ['password'])) {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
    currency: string;
}