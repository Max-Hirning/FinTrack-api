import {Model} from 'mongoose';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {ISignUp} from './types/sign-up.types';
import {ISignIn} from './types/sign-in.types';
import {Collections} from '@/configs/collections';
import {User} from '@userModule/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(Collections.users) private readonly userModel: Model<User>) {}

  isAdmin({email, password}: ISignIn): boolean {
    if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) return true;
    return false;
  }

  async signUp(signUpDto: ISignUp): Promise<string> {
    const user = await this.userModel.create(signUpDto);
    return user._id.toString();
  }
}
