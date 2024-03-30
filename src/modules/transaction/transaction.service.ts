import {InjectModel} from '@nestjs/mongoose';
import {Collections} from 'src/configs/collections';
import {IPagintaion} from 'src/types/pagination.types';
import mongoose, {Model, PipelineStage} from 'mongoose';
import {Transaction} from './schemas/transaction.schema';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {ICreateTransaction, IUpdateTransaction} from './types/transaction.types';
import {IFilters, ITransactionList, ITransactionResponse} from './types/transaction.types';
import {TransactionErrorMessages, TransactionSuccessMessages} from 'src/configs/messages/transaction';

const aggregationPipeLine: PipelineStage[] = [
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
    $lookup: {
      from: 'images',
      as: 'userImage',
      foreignField: '_id',
      localField: 'card.owner.imageId',
    },
  },
  {
    $unset: ['user'],
  },
  {
    $addFields: {
      'card.owner.avatar': {
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
    $unset: ['categoryImage', 'userImage'],
  },
  {
    $project: {
      '_id': 1,
      'date': 1,
      'amount': 1,
      'description': 1,
      'card._id': 1,
      'card.title': 1,
      'card.color': 1,
      'card.balance': 1,
      'card.currency': 1,
      'card.owner._id': 1,
      'card.owner.email': 1,
      'card.owner.avatar': 1,
      'card.owner.currency': 1,
      'card.owner.lastName': 1,
      'card.owner.firstName': 1,
      'category._id': 1,
      'category.title': 1,
      'category.mcc': 1,
      'category.color': 1,
      'category.parentId': 1,
      'category.image': 1,
    },
  }
];

@Injectable()
export class TransactionService {
  constructor(@InjectModel(Collections.transactions) private readonly transactionModel: Model<Transaction>) {}

  async removeOne(id: string): Promise<string> {
    await this.transactionModel.deleteMany({_id: id});
    return TransactionSuccessMessages.removeOne;
  }

  async removeMany(cardId: string): Promise<string> {
    await this.transactionModel.deleteMany({cardId});
    return TransactionSuccessMessages.removeMany;
  }

  async findOne(id: string): Promise<ITransactionResponse> {
    const [transaction] = await this.transactionModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      ...aggregationPipeLine
    ]);
    if(!transaction) throw new HttpException(TransactionErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return transaction;
  }

  async createOne(createTransaction: ICreateTransaction): Promise<string> {
    await this.transactionModel.create({...createTransaction, amount: +createTransaction.amount.toFixed(2)});
    return TransactionSuccessMessages.createOne;
  }

  async updateOne(id: string, updateTransaction: IUpdateTransaction): Promise<string> {
    if(updateTransaction.amount) updateTransaction.amount = +updateTransaction.amount.toFixed(2);
    await this.transactionModel.updateOne({_id: id}, updateTransaction);
    return TransactionSuccessMessages.updateOne;
  }

  async findMany({page, perPage, cards, ...filters}: Partial<IFilters>): Promise<IPagintaion<ITransactionList>> {
    let totalPages = null;
    const aggregationPipeLineCopy = [...aggregationPipeLine];
    if(page && perPage) {
      const skip = (page - 1) * perPage;
      aggregationPipeLineCopy.push({$skip: skip});
      aggregationPipeLineCopy.push({$limit: perPage});
      const totalEntries = await this.transactionModel.countDocuments({...filters, cardId: {$in: cards}});
      totalPages = Math.ceil(totalEntries / perPage);
    }
    const [response] = await this.transactionModel.aggregate([
      {
        $match: {
          ...filters,
          cardId: {$in: cards},
        },
      },
      {
        $sort: {
          'date': -1 
        }
      },
      ...aggregationPipeLineCopy,
      {
        $group: {
          _id: null,
          data: {$push: '$$ROOT'},
          currencies: {$addToSet: '$card.currency'},
        },
      },
      {
        $project: {
          _id: 0, 
          data: 1,
          currencies: 1,
        },
      },
    ]);
    if(!response) throw new HttpException(TransactionErrorMessages.findMany, HttpStatus.NOT_FOUND);
    if(response && (response?.data.length <= 0 || response?.currencies.length <= 0)) throw new HttpException(TransactionErrorMessages.findMany, HttpStatus.NOT_FOUND);
    return ({
      data: response,
      page: page || null,
      totalPages: totalPages || null,
      previous: (page && page > 1) ? page - 1 : null,
      next: (page && page < totalPages) ? page + 1 : null,
    });
  }
}
