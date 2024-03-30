import {OmitType, PartialType} from '@nestjs/mapped-types';
import {SignUpDto} from '../../../modules/auth/dto/sign-up.dto';
import {IsNotEmpty, IsString, IsOptional, IsISO4217CurrencyCode} from 'class-validator';

export class UpdateUserProfileDto extends PartialType(OmitType(SignUpDto, ['password'])) {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsISO4217CurrencyCode()
    currency: string;
}