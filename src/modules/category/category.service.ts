import mongoose, {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import {Category} from './schemas/category.schema';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CategoryErrorMessages, CategorySuccessMessages} from '@messages/category';
import {ICategory, ICreateCategory, IUpdateCategory} from './types/category.types';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Collections.categories) private readonly categoryModel: Model<Category>) {}

  async findMany(): Promise<ICategory[]> {
    const categories = await this.categoryModel.aggregate([
      {
        $lookup: {
          as: 'children',
          localField: '_id',
          from: 'categories',
          foreignField: 'parentId',
        }
      },
      {
        $lookup: {
          as: 'image',
          from: 'images',
          foreignField: '_id',
          localField: 'imageId',
        }
      },
      {
        $addFields: {
          image: { 
            $arrayElemAt: ['$image.url', 0] 
          }
        }
      },
      {
        $unset: ['__v', 'imageId']
      },
      {
        $group: {
          _id: '$parentId',
          mcc: {$first: '$mcc'},
          title: {$first: '$title'},
          color: {$first: '$color'},
          image: {$first: '$image'},
          children: {$push: {
            _id: '$_id',
            title: '$title',
            color: '$color',
            image: '$image',
            children: '$children'
          }},
        }
      },
      {
        $match: {
          _id: null
        }
      },
      {
        $addFields: {
          children: {
            $map: {
              input: '$children',
              as: 'child',
              in: {
                _id: '$$child._id',
                title: '$$child.title',
                color: '$$child.color',
                image: '$$child.image',
                children: {
                  $map: {
                    input: '$$child.children',
                    as: 'subChild',
                    in: {
                      _id: '$$subChild._id',
                      title: '$$subChild.title',
                      color: '$$subChild.color',
                      image: '$$subChild.image',
                      children: '$$subChild.children'
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]);
    if(!categories || categories.length <= 0) throw new HttpException(CategoryErrorMessages.findMany, HttpStatus.NOT_FOUND);
    return categories[0].children;
  }

  async removeOne(id: string): Promise<string> {
    await this.categoryModel.deleteOne({_id: id});
    await this.categoryModel.deleteMany({parentId: id});
    return CategorySuccessMessages.removeOne;
  }

  async findOne(id: string): Promise<ICategory> {
    const [category] = await this.categoryModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        },
      },
      {
        $lookup: {
          as: 'image',
          from: 'images',
          foreignField: '_id',
          localField: 'imageId',
        },
      },
      {
        $addFields: {
          image: {
            $arrayElemAt: ['$image.url', 0]
          },
        },
      },
      {
        $project: {
          __v: 0,
          imageId: 0,
        },
      },
    ]);
    if(!category) throw new HttpException(CategoryErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return category;
  }

  async createOne(createCategory: ICreateCategory): Promise<string> {
    await this.categoryModel.create(createCategory);
    return CategorySuccessMessages.createOne;
  }

  async updateOne(id: string, updateCategory: IUpdateCategory): Promise<string> {
    await this.categoryModel.updateOne({_id: id}, updateCategory);
    return CategorySuccessMessages.updateOne;
  }
}
