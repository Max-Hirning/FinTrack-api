import {HydratedDocument, Types} from 'mongoose';
import {Portfolio} from '../schemas/portfolio.schema';
import {IUserResponse} from '../../../user/types/user.types';

export interface IAsset {
  asset: string;
  amount: number;
  avgBuyPrice: number;
}
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
export interface IPortfolioResponseWithCurrencies<T> {
  portfolio: T;
  currencies: string[];
}
export interface IPortfolioResponseListWithCurrencies<T> {
  portfolios: T[];
  currencies: string[];
}
export interface IPortfolioResponseWithBalance extends IPortfolioResponse {
  balance: number;
  currency: string;
}
export interface IUpdatePortfolio extends Partial<Omit<ICreatePortfolio, 'ownerId'>> {}
export interface IPortfolioResponse extends Pick<IPortfolio, '_id'|'title'|'color'|'assets'> {
  owner: Omit<IUserResponse, 'cardIds'>;
}

export type IPortfolio = HydratedDocument<Portfolio>;