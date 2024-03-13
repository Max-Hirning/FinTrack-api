import {Model} from 'mongoose';
import {Injectable} from '@nestjs/common';
import {User} from './schemas/user.schema';
import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import {UserSuccessMessages} from '@/configs/messages/user';
import {IUpdateUserProfile, IUpdateUserSecurity} from './types/user.types';

@Injectable()
export class UserService {
  constructor(@InjectModel(Collections.users) private readonly userModel: Model<User>) {}

  async remove(id: string): Promise<string> {
    await this.userModel.deleteOne({_id: id});
    return UserSuccessMessages.removeOne;
  }
  
  async findOne(id: string): Promise<string> {
    return `This action returns a #${id} user`;
  }

  async updateProfile(id: string, updateUserProfile: IUpdateUserProfile): Promise<string> {
    await this.userModel.updateOne({_id: id}, updateUserProfile);
    return UserSuccessMessages.updateOne;
  }

  async updateSecurity(id: string, updateUserSecurity: IUpdateUserSecurity): Promise<string> {
    await this.userModel.updateOne({_id: id}, updateUserSecurity);
    return UserSuccessMessages.updateOne;
  }
}
