import {HydratedDocument} from 'mongoose';
import {User} from '../schemas/user.schema';

export interface IUpdateUserProfile {
  email?: string;
  lastName?: string;
  currency?: string;
  firstName?: string;
  imageId?: string|null;
}
export interface IUpdateUserSecurity {
  password: string;
}
export interface IUserResponse extends Pick<IUser, '_id'|'email'|'lastName'|'firstName'|'currency'> {
  cardIds: string[];
  avatar: null|string;
}

export type IUser = HydratedDocument<User>;