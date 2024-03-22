import {Types, HydratedDocument} from 'mongoose';
import {Transaction} from '../schemas/transaction.schema';
import {ICardResponse} from '@/modules/card/types/card.types';
import {ICategoryResponse} from '@/modules/category/types/category.types';

export interface IFilters {
  date: {
    $gte: string;
    $lte: string;
  };
  page: number;
  perPage: number;
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
export interface ITransactionResponse extends Pick<ITransaction, '_id'|'date'|'amount'|'description'> {
  card: ICardResponse;
  category: ICategoryResponse;
}

export type ITransaction = HydratedDocument<Transaction>;