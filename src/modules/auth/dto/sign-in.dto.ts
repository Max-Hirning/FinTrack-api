import {SignUpDto} from './sign-up.dto';
import {PickType} from '@nestjs/mapped-types';

export class SignInDto extends PickType(SignUpDto, ['email', 'password']) {}
