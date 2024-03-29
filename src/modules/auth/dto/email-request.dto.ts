import {SignInDto} from './sign-in.dto';
import {PickType} from '@nestjs/mapped-types';
import {IsString, IsNotEmpty} from 'class-validator';

export class EmailRequestDto extends PickType(SignInDto, ['email']) {
  @IsString()
  @IsNotEmpty()
    url: string;
}