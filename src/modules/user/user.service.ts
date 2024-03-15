import {User} from './schemas/user.schema';
import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import mongoose, {Model, PipelineStage} from 'mongoose';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserErrorMessages, UserSuccessMessages} from '@messages/user';
import {IUpdateUserProfile, IUpdateUserSecurity, IUser} from './types/user.types';

const aggregationPipeLine: PipelineStage[] = [
  {
    $lookup: {
      as: 'image',
      from: 'images',
      foreignField: '_id',
      localField: 'imageId',
    },
  },
  {
    $lookup: {
      as: 'cards',
      from: 'cards',
      localField: '_id',
      foreignField: 'ownerId',
    }
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
      _id: 1,
      email: 1,
      avatar: 1,
      currency: 1,
      lastName: 1,
      firstName: 1,
      cardIds: '$cards._id'
    },
  },
];

@Injectable()
export class UserService {
  constructor(@InjectModel(Collections.users) private readonly userModel: Model<User>) {}

  async findOne(id: string): Promise<IUser> {
    const [user] = await this.userModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        },
      },
      ...aggregationPipeLine
    ]);
    if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return user;
  }

  async removeOne(id: string): Promise<string> {
    await this.userModel.deleteOne({_id: id});
    return UserSuccessMessages.removeOne;
  }

  async updateProfile(id: string, updateUserProfile: IUpdateUserProfile): Promise<string> {
    await this.userModel.updateOne({_id: id}, {...updateUserProfile, $inc: {version: 0.1}});
    return UserSuccessMessages.updateOne;
  }

  async updateSecurity(id: string, updateUserSecurity: IUpdateUserSecurity): Promise<string> {
    await this.userModel.updateOne({_id: id}, {...updateUserSecurity, $inc: {version: 1}});
    return UserSuccessMessages.updateOne;
  }
}
