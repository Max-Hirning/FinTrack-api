import {InjectModel} from '@nestjs/mongoose';
import {Portfolio} from './schemas/portfolio.schema';
import mongoose, {Model, PipelineStage} from 'mongoose';
import {Collections} from '../../../configs/collections';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PortfolioErrorMessages, PortfolioSuccessMessages} from '../../../configs/messages/portfolio';
import {ICreatePortfolio, IFilters, IPortfolioResponse, IPortfolioResponseListWithCurrencies, IPortfolioResponseWithCurrencies, IUpdatePortfolio} from './types/portfolio.types';

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
      'assets': 1,
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
export class PortfolioService {
  constructor(@InjectModel(Collections.portfolios) private readonly portfolioModel: Model<Portfolio>) {}

  async removeOne(id: string): Promise<string> {
    await this.portfolioModel.deleteOne({_id: id});
    return PortfolioSuccessMessages.removeOne;
  }

  async removeMany(ownerId: string): Promise<string> {
    await this.portfolioModel.deleteMany({ownerId: ownerId});
    return PortfolioSuccessMessages.removeMany;
  }

  async createOne(createPortfolio: ICreatePortfolio): Promise<string> {
    await this.portfolioModel.create(createPortfolio);
    return PortfolioSuccessMessages.createOne;
  }

  async updateOne(id: string, updatePortfolio: IUpdatePortfolio): Promise<string> {
    await this.portfolioModel.updateOne({_id: id}, updatePortfolio);
    return PortfolioSuccessMessages.updateOne;
  }

  async findOne(id: string): Promise<IPortfolioResponseWithCurrencies<IPortfolioResponse>> {
    const [portfolio] = await this.portfolioModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        }
      },
      ...aggregationPipeLine,
      {
        $addFields: {
          portfolio: '$$ROOT'
        }
      },
      {
        $project: {
          _id: 0,
          portfolio: 1,
          currencies: {
            $map: {
              input: {$objectToArray: '$portfolio.assets'},
              as: 'asset',
              in: '$$asset.k'
            }
          }
        }
      }
    ]);
    if(!portfolio) throw new HttpException(PortfolioErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return portfolio;
  }

  async findMany(filters: Partial<IFilters>): Promise<IPortfolioResponseListWithCurrencies<IPortfolioResponse>> {
    const [response] = await this.portfolioModel.aggregate([
      {
        $match: filters
      },
      ...aggregationPipeLine,
      {
        $group: {
          _id: null,
          portfolios: {$push: '$$ROOT'},
          currencies: {$addToSet: {$objectToArray: '$assets'}}
        }
      },
      {
        $unwind: '$currencies'
      },
      {
        $unwind: '$currencies'
      },
      {
        $group: {
          _id: null,
          portfolios: {$first: '$portfolios'},
          currencies: {$addToSet: '$currencies.k'}
        }
      },
      {
        $project: {
          _id: 0,
          portfolios: 1,
          currencies: 1
        }
      }
    ]);
    return response;
  }
}
