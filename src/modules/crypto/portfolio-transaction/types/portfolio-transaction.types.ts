import {Types, HydratedDocument} from 'mongoose';
import {IPortfolioResponse} from '../../portfolio/types/portfolio.types';
import {PortfolioTransaction} from '../schemas/portfolio-transaction.schema';

export interface IFilters {
  date: {
    $gte: string;
    $lte: string;
  };
  page: number;
  perPage: number;
  portfolios: Types.ObjectId[];
  amount: {$gt: number} | {$lt: number};
}
export interface ICreatePortfolioTransaction {
  date: string;
  price: number;
  asset: string;
  amount: number;
  portfolioId: string;
  description: string;
}
export interface IUpdatePortfolioTransaction extends Partial<Omit<ICreatePortfolioTransaction, 'asset'|'portfolioId'>> {}
export interface IPortfolioTransactionResponse extends Pick<IPortfolioTransaction, 'asset'|'price'|'_id'|'date'|'amount'|'description'> {
  portfolio: IPortfolioResponse;
}

export type IPortfolioTransaction = HydratedDocument<PortfolioTransaction>;