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
export interface ICategoryResponse extends Pick<ICategory, '_id'|'mcc'|'title'|'color'> {
  image: string;
  parentId?: string;
  children?: ICategoryResponse[];
}

export type ICategory = HydratedDocument<Category>