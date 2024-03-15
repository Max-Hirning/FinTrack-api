import {Card} from '../schemas/card.schema';
import {Types, HydratedDocument} from 'mongoose';

export interface IFilters {
  ownerId: Types.ObjectId;
}
export interface ICreateCard {
  title: string;
  color: string;
  ownerId: string;
  balance: number;
  currency: string;
  startBalance: number;
}
export interface IUpdateCard extends Partial<Omit<ICreateCard, 'startBalance'|'ownerId'|'balance'>> {}

export type ICard = HydratedDocument<Card>;