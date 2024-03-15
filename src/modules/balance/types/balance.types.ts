import {HydratedDocument, Types} from 'mongoose';
import {Balance} from '../schemas/balance.schema';

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
export interface IUpdateBalance extends Partial<Pick<ICreateBalance, 'balance'>> {}

export type IBalance = HydratedDocument<Balance>;