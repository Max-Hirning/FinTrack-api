import mongoose, {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import {IFilters} from './types/transaction.types';
import {Transaction} from './schemas/transaction.schema';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {TransactionErrorMessages, TransactionSuccessMessages} from '@messages/transaction';
import {ICreateTransaction, ITransaction, IUpdateTransaction} from './types/transaction.types';

@Injectable()
export class TransactionService {
  constructor(@InjectModel(Collections.transactions) private readonly transactionModel: Model<Transaction>) {}

  async removeOne(id: string): Promise<string> {
    await this.transactionModel.deleteMany({_id: id});
    return TransactionSuccessMessages.removeOne;
  }

  async findOne(id: string): Promise<ITransaction> {
    const [transaction] = await this.transactionModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
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
          as: 'category',
          from: 'categories',
          foreignField: '_id',
          localField: 'categoryId',
        },
      },
      {
        $lookup: {
          from: 'images',
          foreignField: '_id',
          as: 'categoryImage',
          localField: 'category.imageId',
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
          'category': {
            $mergeObjects: [
              {
                $arrayElemAt: ['$category', 0]
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
          'category.image': {
            $arrayElemAt: ['$categoryImage.url', 0]
          },
        },
      },
      {
        $unset: ['card.owner.avatar', 'categoryImage', 'userImage'],
      },
      {
        $project: {
          __v: 0,
          cardId: 0,
          categoryId: 0,
          'card.__v': 0,
          'category.__v': 0,
          'card.ownerId': 0,
          'card.owner.__v': 0,
          'card.owner.date': 0,
          'category.imageId': 0,
          'card.startBalance': 0,
          'card.owner.imageId': 0,
          'card.owner.password': 0,
        }
      }
    ]);
    if(!transaction) throw new HttpException(TransactionErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return transaction;
  }

  async removeMany(cardId: string): Promise<string> {
    await this.transactionModel.deleteMany({cardId});
    return TransactionSuccessMessages.removeMany;
  }

  async createOne(createTransaction: ICreateTransaction): Promise<string> {
    await this.transactionModel.create({...createTransaction, amount: +createTransaction.amount.toFixed(2)});
    return TransactionSuccessMessages.createOne;
  }

  async findMany({cards, ...filters}: Partial<IFilters>): Promise<ITransaction[]> {
    const transactions = await this.transactionModel.aggregate([
      {
        $match: {
          ...filters,
          cardId: {$in: cards},
        },
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
          as: 'category',
          from: 'categories',
          foreignField: '_id',
          localField: 'categoryId',
        },
      },
      {
        $lookup: {
          from: 'images',
          foreignField: '_id',
          as: 'categoryImage',
          localField: 'category.imageId',
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
          'category': {
            $mergeObjects: [
              {
                $arrayElemAt: ['$category', 0]
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
          'category.image': {
            $arrayElemAt: ['$categoryImage.url', 0]
          },
        },
      },
      {
        $unset: ['card.owner.avatar', 'categoryImage', 'userImage'],
      },
      {
        $project: {
          __v: 0,
          cardId: 0,
          categoryId: 0,
          'card.__v': 0,
          'category.__v': 0,
          'card.ownerId': 0,
          'card.owner.__v': 0,
          'card.owner.date': 0,
          'category.imageId': 0,
          'card.startBalance': 0,
          'card.owner.imageId': 0,
          'card.owner.password': 0,
        }
      }
    ]).sort({date: -1});
    if(!transactions || transactions.length <= 0) throw new HttpException(TransactionErrorMessages.findMany, HttpStatus.NOT_FOUND);
    return transactions;
  }

  async updateOne(id: string, updateTransaction: IUpdateTransaction): Promise<string> {
    if(updateTransaction.amount) updateTransaction.amount = +updateTransaction.amount.toFixed(2);
    await this.transactionModel.updateOne({_id: id}, updateTransaction);
    return TransactionSuccessMessages.updateOne;
  }
}
