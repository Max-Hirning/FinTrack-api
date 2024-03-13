import mongoose, {Model} from 'mongoose';
import {User} from './schemas/user.schema';
import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserErrorMessages, UserSuccessMessages} from '@/configs/messages/user';
import {IUpdateUserProfile, IUpdateUserSecurity, IUser} from './types/user.types';

@Injectable()
export class UserService {
  constructor(@InjectModel(Collections.users) private readonly userModel: Model<User>) {}

  async remove(id: string): Promise<string> {
    await this.userModel.deleteOne({_id: id});
    return UserSuccessMessages.removeOne;
  }
  
  async findOne(id: string): Promise<IUser> {
    const [user] = await this.userModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        },
      },
      {
        $lookup: {
          as: 'image',
          from: 'images',
          foreignField: '_id',
          localField: 'imageId',
        },
      },
      {
        $addFields: {
          avatar: {
            $arrayElemAt: ['$image.url', 0]
          },
        },
      },
      {
        $project: {
          __v: 0,
          date: 0,
          image: 0,
          imageId: 0,
          password: 0,
        },
      },
    ]);
    if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return user;
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
