import {PickType} from '@nestjs/mapped-types';
import {SignUpDto} from 'src/modules/auth/dto/sign-up.dto';
import {MaxLength, IsNotEmpty, IsString, MinLength} from 'class-validator';

export class UpdateUserSecurityDto extends PickType(SignUpDto, ['password']) {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
    oldPassword: string;
}