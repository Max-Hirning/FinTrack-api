import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import {Category} from './schemas/category.schema';
import mongoose, {Model, PipelineStage} from 'mongoose';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CategoryErrorMessages, CategorySuccessMessages} from '@messages/category';
import {ICategoryResponse, ICreateCategory, IUpdateCategory} from './types/category.types';

const aggregationPipeLine: PipelineStage[] = [
  {
    $lookup: {
      as: 'image',
      from: 'images', // Collection name of the Image model
      foreignField: '_id',
      localField: 'imageId',
    },
  },
  {
    $project: {
      _id: 1,
      mcc: 1,
      image: {
        $arrayElemAt: ['$image', 0], // Take the first element of the 'image' array
      },
      title: 1,
      color: 1,
      parentId: 1,
    },
  },
  {
    $project: {
      _id: 1,
      mcc: 1,
      title: 1,
      color: 1,
      parentId: 1,
      children: [],
      image: '$image.url', // Extract the 'url' field from the 'image' document
    },
  },
];

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Collections.categories) private readonly categoryModel: Model<Category>) {}

  async findMany(): Promise<ICategoryResponse[]> {
    const categories = await this.categoryModel.aggregate(aggregationPipeLine);
    if(!categories || categories.length <= 0) throw new HttpException(CategoryErrorMessages.findMany, HttpStatus.NOT_FOUND);
    return Object.values(categories.reduce((res, el: ICategoryResponse) => {
      if(el.parentId) {
        res[el.parentId].children.push(el);
      } else {
        res[el._id] = el;
      }
      return res;
    }, {}));
  }

  async removeOne(id: string): Promise<string> {
    await this.categoryModel.deleteOne({_id: id});
    await this.categoryModel.deleteMany({parentId: id});
    return CategorySuccessMessages.removeOne;
  }

  async findOne(id: string): Promise<ICategoryResponse> {
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
