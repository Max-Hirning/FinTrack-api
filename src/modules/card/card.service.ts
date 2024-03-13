import mongoose, {Model} from 'mongoose';
import {Card} from './schemas/card.schema';
import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CardErrorMessages, CardSuccessMessages} from '@messages/card';
import {ICard, ICreateCard, IFilters, IUpdateCard} from './types/card.types';

@Injectable()
export class CardService {
  constructor(@InjectModel(Collections.cards) private readonly cardModel: Model<Card>) {}

  async findOne(id: string): Promise<ICard> {
    const [card] = await this.cardModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          as: 'owner',
          from: 'users',
          foreignField: '_id',
          localField: 'ownerId',
        }
      },
      {
        $unwind: '$owner'
      },
      {
        $lookup: {
          as: 'avatar',
          from: 'images',
          foreignField: '_id',
          localField: 'owner.imageId',
        }
      },
      {
        $addFields: {
          'owner.avatar': {
            $arrayElemAt: ['$avatar.url', 0]
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          owner: {
            avatar: {
              $cond: [
                {$gt: [{$size: '$avatar'}, 0]},
                {$arrayElemAt: ['$avatar.url', 0]},
                null
              ]
            },
            _id: '$owner._id',
            email: '$owner.email',
            lastName: '$owner.lastName',
            currency: '$owner.currency',
            firstName: '$owner.firstName',
          },
          color: 1,
          balance: 1,
          currency: 1,
        }
      }
    ]);
    if(!card) throw new HttpException(CardErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return card;
  }

  async removeOne(id: string): Promise<string> {
    await this.cardModel.deleteOne({_id: id});
    return CardSuccessMessages.removeOne;
  }

  async removeMany(ownerId: string): Promise<string> {
    await this.cardModel.deleteMany({ownerId: ownerId});
    return CardSuccessMessages.removeMany;
  }

  async findMany(filters: IFilters): Promise<ICard[]> {
    const cards = await this.cardModel.aggregate([
      {
        $match: filters
      },
      {
        $lookup: {
          as: 'owner',
          from: 'users',
          foreignField: '_id',
          localField: 'ownerId',
        }
      },
      {
        $unwind: '$owner'
      },
      {
        $lookup: {
          as: 'avatar',
          from: 'images',
          foreignField: '_id',
          localField: 'owner.imageId',
        }
      },
      {
        $addFields: {
          'owner.avatar': {
            $arrayElemAt: ['$avatar.url', 0]
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          owner: {
            avatar: {
              $cond: [
                {$gt: [{$size: '$avatar'}, 0]},
                {$arrayElemAt: ['$avatar.url', 0]},
                null
              ]
            },
            _id: '$owner._id',
            email: '$owner.email',
            lastName: '$owner.lastName',
            currency: '$owner.currency',
            firstName: '$owner.firstName',
          },
          color: 1,
          balance: 1,
          currency: 1,
        }
      }
    ]);
    if(!cards || cards.length <= 0) throw new HttpException(CardErrorMessages.findMany, HttpStatus.NOT_FOUND);
    return cards;
  }

  async createOne(createCard: ICreateCard): Promise<string> {
    await this.cardModel.create(createCard);
    return CardSuccessMessages.createOne;
  }

  async updateOne(id: string, updateCard: IUpdateCard): Promise<string> {
    await this.cardModel.updateOne({_id: id}, updateCard);
    return CardSuccessMessages.updateOne;
  }
}
