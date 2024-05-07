import {HydratedDocument, Types} from 'mongoose';
import {Portfolio} from '../schemas/portfolio.schema';
import {IUserResponse} from '../../../user/types/user.types';

export interface IFilters {
  _id: {
    $in: Types.ObjectId[];
  };
  ownerId: Types.ObjectId
}
export interface ICreatePortfolio {
  title: string;
  color: string;
  ownerId: string;
}
export interface IUpdatePortfolio extends Partial<Omit<ICreatePortfolio, 'ownerId'>> {}
export interface IPortfolioResponse extends Pick<IPortfolio, '_id'|'title'|'color'|'assets'> {
  owner: Omit<IUserResponse, 'cardIds'>;
}

export type IPortfolio = HydratedDocument<Portfolio>;