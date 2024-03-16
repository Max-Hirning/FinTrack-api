import {Model} from 'mongoose';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Balance} from './schemas/balance.schema';
import {Collections} from '@/configs/collections';
import {BalanceSuccessMessages} from '@/configs/messages/balance';
import {IBalance, ICreateBalance, IFilters, IUpdateBalance} from './types/balance.types';

@Injectable()
export class BalanceService {
  constructor(@InjectModel(Collections.balances) private readonly balanceModel: Model<Balance>) {}

  async removeOne(id: string): Promise<string> {
    await this.balanceModel.deleteOne({_id: id});
    return BalanceSuccessMessages.removeOne;
  }

  async removeMany(cardId: string): Promise<string> {
    await this.balanceModel.deleteOne({cardId});
    return BalanceSuccessMessages.removeOne;
  }

  async createOne(createBalance: ICreateBalance): Promise<string> {
    await this.balanceModel.create({...createBalance, balance: +createBalance.balance.toFixed(2)});
    return BalanceSuccessMessages.createOne;
  }

  async findMany({cards, ...filters}: Partial<IFilters>): Promise<IBalance[]> {
    const balances = await this.balanceModel.aggregate([
      {
        $match: {
          ...filters,
          cardId: {$in: cards},
        },
      },
      {
        $sort: {
          'date': 1, // Sort by date in ascending order
        }
      },
      {
        $lookup: {
          as: 'card',
          from: 'cards',
          foreignField: '_id',
          localField: 'cardId',
        },
      },
      {
        $lookup: {
          as: 'user',
          from: 'users',
          foreignField: '_id',
          localField: 'card.ownerId',
        },
      },
      {
        $lookup: {
          from: 'images',
          as: 'userImage',
          foreignField: '_id',
          localField: 'user.imageId',
        },
      },
      {
        $addFields: {
          'card': {
            $mergeObjects: [
              {
                $arrayElemAt: ['$card', 0]
              },
              {
                owner: {
                  $arrayElemAt: ['$user', 0],
                },
              },
            ],
          },
        },
      },
      {
        $unset: ['user'],
      },
      {
        $addFields: {
          'card.owner.image': {
            $cond: {
              if: {
                $eq: ['$card.owner.imageId', null]
              },
              then: null,
              else: {
                $arrayElemAt: ['$userImage.url', 0]
              },
            },
          },
        },
      },
      {
        $unset: ['card.owner.avatar', 'userImage'],
      },
      {
        $project: {
          __v: 0,
          cardId: 0,
          'card.__v': 0,
          'card.ownerId': 0,
          'card.owner.__v': 0,
          'card.owner.date': 0,
          'card.startBalance': 0,
          'card.owner.imageId': 0,
          'card.owner.password': 0,
        }
      }
    ]);
    return balances;
  }

  async updateOne(id: string, updateBalance: IUpdateBalance): Promise<string> {
    await this.balanceModel.updateOne({_id: id}, {balance: +updateBalance.balance.toFixed(2)});
    return BalanceSuccessMessages.updateOne;
  }

  async updateMany(ids: string[], updateBalanceOn: number): Promise<string> {
    await this.balanceModel.updateMany({_id: {$in: ids}}, {$inc: {balance: updateBalanceOn}});
    return BalanceSuccessMessages.updateMany;
  }
}
