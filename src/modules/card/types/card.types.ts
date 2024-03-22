import {Card} from '../schemas/card.schema';
import {Types, HydratedDocument} from 'mongoose';
import {IUserResponse} from '@/modules/user/types/user.types';

export interface IFilters {
  _id: {
    $in: Types.ObjectId[];
  };
  ownerId: Types.ObjectId
}
export interface ICreateCard {
  title: string;
  color: string;
  ownerId: string;
  balance: number;
  currency: string;
  startBalance: number;
}
export interface ICardResponse extends Pick<ICard, '_id'|'title'|'color'|'balance'|'currency'> {
  owner: Omit<IUserResponse, 'cardIds'>;
}
export interface IUpdateCard extends Partial<Omit<ICreateCard, 'startBalance'|'ownerId'|'balance'>> {}

export type ICard = HydratedDocument<Card>;