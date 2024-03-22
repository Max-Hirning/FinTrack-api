import {HydratedDocument, Types} from 'mongoose';
import {Balance} from '../schemas/balance.schema';
import {ICardResponse} from '@/modules/card/types/card.types';

export interface IFilters {
  date: {
    $gt?: string;
    $lt?: string;
    $gte?: string;
    $lte?: string;
  };
  cards: Types.ObjectId[];
}
export interface ICreateBalance {
  date: string;
  cardId: string;
  balance: number;
}
export interface IUpdateBalance extends Pick<ICreateBalance, 'balance'> {}
export interface IBalanceResponse extends Pick<IBalance, '_id'|'date'|'balance'> {
  card: ICardResponse;
}

export type IBalance = HydratedDocument<Balance>;