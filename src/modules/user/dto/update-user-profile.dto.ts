import {OmitType, PartialType} from '@nestjs/mapped-types';
import {SignUpDto} from '../../../modules/auth/dto/sign-up.dto';
import {IsNotEmpty, IsString, IsOptional} from 'class-validator';

export class UpdateUserProfileDto extends PartialType(OmitType(SignUpDto, ['password'])) {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
    currency: string;
}