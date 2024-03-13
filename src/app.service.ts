import {Model} from 'mongoose';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import {User} from '@userModule/schemas/user.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(Collections.users) private readonly userModel: Model<User>) {}

  async confirmEmail(id: string): Promise<void> {
    await this.userModel.updateOne({_id: id}, {__v: 1});
  }
}
