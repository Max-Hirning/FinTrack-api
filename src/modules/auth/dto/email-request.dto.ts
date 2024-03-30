import {SignInDto} from './sign-in.dto';
import {PickType} from '@nestjs/mapped-types';
import {IsString, IsNotEmpty, IsUrl} from 'class-validator';

export class EmailRequestDto extends PickType(SignInDto, ['email']) {
  @IsUrl()
  @IsString()
  @IsNotEmpty()
    url: string;
}