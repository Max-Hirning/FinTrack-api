import {User} from './schemas/user.schema';
import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '../../configs/collections';
import mongoose, {Model, PipelineStage} from 'mongoose';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserErrorMessages, UserSuccessMessages} from '../../configs/messages/user';
import {IUpdateUserProfile, IUpdateUserSecurity, IUserResponse} from './types/user.types';

@Injectable()
export class UserService {
  constructor(@InjectModel(Collections.users) private readonly userModel: Model<User>) {}

  async removeOne(id: string): Promise<string> {
    await this.userModel.deleteOne({_id: id});
    return UserSuccessMessages.removeOne;
  }

  async findOne(id: string, role?: string): Promise<IUserResponse> {
    let cardsLookupStage: PipelineStage;
    if(role === 'Test') {
      cardsLookupStage = {
        $lookup: {
          as: 'cards',
          pipeline: [],
          from: 'cards',
        }
      };
    } else {
      cardsLookupStage = {
        $lookup: {
          as: 'cards',
          from: 'cards',
          localField: '_id',
          foreignField: 'ownerId',
        }
      };
    }
  
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
      cardsLookupStage,
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
      }
    ]);  
    if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return user;
  }

  async updateProfile(id: string, updateUserProfile: IUpdateUserProfile): Promise<string> {
    const data = {...updateUserProfile};
    if(updateUserProfile.email) {
      data['$inc'] = {version: 0.1};
      data['__v'] = 0;
    }
    await this.userModel.updateOne({_id: id}, data);
    return UserSuccessMessages.updateOne;
  }

  async updateSecurity(id: string, updateUserSecurity: IUpdateUserSecurity): Promise<string> {
    await this.userModel.updateOne({_id: id}, {...updateUserSecurity, $inc: {version: 1}});
    return UserSuccessMessages.updateOne;
  }
}
