import {Card} from './schemas/card.schema';
import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '../../configs/collections';
import mongoose, {Model, PipelineStage} from 'mongoose';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CardSuccessMessages, CardErrorMessages} from '../../configs/messages/card';
import {ICardResponse, ICardsList, ICreateCard, IFilters, IUpdateCard} from './types/card.types';

const aggregationPipeLine: PipelineStage[] = [
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
      '_id': 1,
      'title': 1,
      'color': 1,
      'balance': 1,
      'currency': 1,
      'owner._id': 1,
      'owner.email': 1,
      'owner.avatar': 1,
      'owner.currency': 1,
      'owner.lastName': 1,
      'owner.firstName': 1,
    }
  }
];

@Injectable()
export class CardService {
  constructor(@InjectModel(Collections.cards) private readonly cardModel: Model<Card>) {}

  async removeOne(id: string): Promise<string> {
    await this.cardModel.deleteOne({_id: id});
    return CardSuccessMessages.removeOne;
  }

  async findOne(id: string): Promise<ICardResponse> {
    const [card] = await this.cardModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        }
      },
      ...aggregationPipeLine,
    ]);
    if(!card) throw new HttpException(CardErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return card;
  }

  async removeMany(ownerId: string): Promise<string> {
    await this.cardModel.deleteMany({ownerId: ownerId});
    return CardSuccessMessages.removeMany;
  }

  async createOne(createCard: ICreateCard): Promise<string> {
    await this.cardModel.create({...createCard, balance: +createCard.balance.toFixed(2), startBalance: +createCard.startBalance.toFixed(2)});
    return CardSuccessMessages.createOne;
  }

  async findMany(filters: Partial<IFilters>): Promise<ICardsList> {
    const [response] = await this.cardModel.aggregate([
      {
        $match: filters
      },
      ...aggregationPipeLine,
      {
        $group: {
          _id: null,
          cards: {$push: '$$ROOT'},
          currencies: {$addToSet: '$currency'}
        }
      },
      {
        $project: {
          _id: 0,
          cards: 1,
          currencies: 1
        }
      }
    ]);
    return {currencies: response?.currencies || [], cards: response?.cards || []};
  }

  async updateOne(id: string, updateCard: IUpdateCard): Promise<string> {
    await this.cardModel.updateOne({_id: id}, updateCard);
    return CardSuccessMessages.updateOne;
  }
}
