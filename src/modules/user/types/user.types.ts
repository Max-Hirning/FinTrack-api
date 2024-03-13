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

export type IUser = HydratedDocument<User>;