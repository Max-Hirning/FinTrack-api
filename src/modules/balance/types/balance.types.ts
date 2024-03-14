import {HydratedDocument} from 'mongoose';
import {Balance} from '../schemas/balance.schema';

export interface IFilters {
  date: {
    $gt?: string;
    $lt?: string;
    $gte?: string;
    $lte?: string;
  };
  cards: string[];
}
export interface ICreateBalance {
  date: string;
  cardId: string;
  balance: number;
}
export interface IUpdateBalance extends Partial<Pick<ICreateBalance, 'balance'>> {}

export type IBalance = HydratedDocument<Balance>;