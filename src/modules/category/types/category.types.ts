import {HydratedDocument} from 'mongoose';
import {Category} from '../schemas/category.schema';

export interface ICreateCategory {
  mcc: string[];
  title: string;
  color: string;
  imageId: string;
  parentId?: string;
}
export interface ICategory extends HydratedDocument<Category> {
  children?: HydratedDocument<Category>[];
}
export interface IUpdateCategory extends Partial<ICreateCategory> {}