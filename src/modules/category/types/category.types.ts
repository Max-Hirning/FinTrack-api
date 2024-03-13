import {HydratedDocument} from 'mongoose';
import {Category} from '../schemas/category.schema';

export interface ICreateCategory {
  mcc: string[];
  title: string;
  color: string;
  imageId: string;
  parentId?: string;
}
export interface IUpdateCategory extends Partial<ICreateCategory> {}

export type ICategory = HydratedDocument<Category>;