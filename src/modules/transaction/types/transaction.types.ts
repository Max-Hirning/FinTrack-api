import {Types, HydratedDocument} from 'mongoose';
import {Transaction} from '../schemas/transaction.schema';

export interface IFilters {
  date: {
    $gte: string;
    $lte: string;
  };
  page: number;
  cards: Types.ObjectId[];
}
export interface ITransactionList {
  data: ITransaction[];
  currencies: string[];
}
export interface ICreateTransaction {
  date: string;
  cardId: string;
  amount: number;
  categoryId: string;
  description: string;
}
export interface IUpdateTransaction extends Partial<ITransaction> {}

export type ITransaction = HydratedDocument<Transaction>;