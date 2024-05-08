import {InjectModel} from '@nestjs/mongoose';
import {Collections} from 'configs/collections';
import {IPagintaion} from 'types/pagination.types';
import mongoose, {PipelineStage, Model} from 'mongoose';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PortfolioTransaction} from './schemas/portfolio-transaction.schema';
import {IPortfolioTransactionResponse} from './types/portfolio-transaction.types';
import {TransactionErrorMessages, TransactionSuccessMessages} from 'configs/messages/transaction';
import {ICreatePortfolioTransaction, IFilters, IUpdatePortfolioTransaction} from './types/portfolio-transaction.types';

const aggregationPipeLine: PipelineStage[] = [
  {
    $lookup: {
      as: 'portfolio',
      from: 'portfolios',
      foreignField: '_id',
      localField: 'portfolioId',
    },
  },
  {
    $lookup: {
      as: 'user',
      from: 'users',
      foreignField: '_id',
      localField: 'portfolio.ownerId',
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
    $lookup: {
      from: 'images',
      as: 'userImage',
      foreignField: '_id',
      localField: 'portfolio.owner.imageId',
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
    },
  },
  {
    $unset: ['userImage'],
  },
  {
    $project: {
      '_id': 1,
      'date': 1,
      'amount': 1,
      'description': 1,
      'portfolio._id': 1,
      'portfolio.title': 1,
      'portfolio.color': 1,
      'portfolio.balance': 1,
      'portfolio.currency': 1,
      'portfolio.owner._id': 1,
      'portfolio.owner.email': 1,
      'portfolio.owner.avatar': 1,
      'portfolio.owner.currency': 1,
      'portfolio.owner.lastName': 1,
      'portfolio.owner.firstName': 1,
    },
  }
];

@Injectable()
export class PortfolioTransactionService {
  constructor(@InjectModel(Collections.portfolioTransactions) private readonly portfolioTransactionModel: Model<PortfolioTransaction>) {}

  async removeOne(id: string): Promise<string> {
    await this.portfolioTransactionModel.deleteMany({_id: id});
    return TransactionSuccessMessages.removeOne;
  }

  async removeMany(portfolioId: string): Promise<string> {
    await this.portfolioTransactionModel.deleteMany({portfolioId});
    return TransactionSuccessMessages.removeMany;
  }

  async findOne(id: string): Promise<IPortfolioTransactionResponse> {
    const [transaction] = await this.portfolioTransactionModel.aggregate([
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

  async createOne(createTransaction: ICreatePortfolioTransaction): Promise<string> {
    await this.portfolioTransactionModel.create({...createTransaction, price: +createTransaction.price.toFixed(2)});
    return TransactionSuccessMessages.createOne;
  }

  async updateOne(id: string, updateTransaction: IUpdatePortfolioTransaction): Promise<string> {
    if(updateTransaction.price) updateTransaction.price = +updateTransaction.price.toFixed(2);
    await this.portfolioTransactionModel.updateOne({_id: id}, updateTransaction);
    return TransactionSuccessMessages.updateOne;
  }

  async findMany({page, perPage, portfolios, ...filters}: Partial<IFilters>): Promise<IPagintaion<IPortfolioTransactionResponse[]>> {
    let totalPages = null;
    const aggregationPipeLineCopy = [...aggregationPipeLine];
    if(page && perPage) {
      const skip = (page - 1) * perPage;
      aggregationPipeLineCopy.push({$skip: skip});
      aggregationPipeLineCopy.push({$limit: perPage});
      const totalEntries = await this.portfolioTransactionModel.countDocuments({...filters, cardId: {$in: portfolios}});
      totalPages = Math.ceil(totalEntries / perPage);
    }
    const response = await this.portfolioTransactionModel.aggregate([
      {
        $match: {
          ...filters,
          portfolioId: {$in: portfolios},
        },
      },
      {
        $sort: {
          'date': -1 
        }
      },
      ...aggregationPipeLineCopy,
    ]);
    return ({
      data: response,
      page: page || null,
      totalPages: totalPages || null,
      previous: (page && page > 1) ? page - 1 : null,
      next: (page && page < totalPages) ? page + 1 : null,
    });
  }
}
