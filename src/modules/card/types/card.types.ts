import {Card} from '../schemas/card.schema';
import mongoose, {HydratedDocument} from 'mongoose';

export interface IFilters {
  ownerId: mongoose.Types.ObjectId;
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