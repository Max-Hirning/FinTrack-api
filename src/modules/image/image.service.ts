import {Model} from 'mongoose';
import {IImage} from './types/image.types';
import {Image} from './schemas/image.schema';
import {InjectModel} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {ImageErrorMessages, ImageSuccessMessages} from '@messages/image';
import {v2 as cloudinary, CropMode, Gravity, ImageFormat, UploadApiErrorResponse, UploadApiOptions, UploadApiResponse} from 'cloudinary';

interface IOptions extends Required<Pick<UploadApiOptions, 'folder'>> {
  fetch_format?: ImageFormat;
  gravity?: Gravity;
  crop?: CropMode;
  height?: number;
  width?: number;
}

@Injectable()
export class ImageService {
  constructor(@InjectModel(Collections.images) private readonly imageModel: Model<Image>) {}

  async findOne(id: string): Promise<IImage> {
    const image = await this.imageModel.findOne({_id: id});
    if(!image) throw new HttpException(ImageErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return image;
  }

  async removeOne(id: string): Promise<string> {
    const image = await this.findOne(id);
    const {result} = await cloudinary.uploader.destroy(image.id);
    if(result === 'ok') {
      await this.imageModel.deleteOne({_id: id});
      return ImageSuccessMessages.removeOne;
    }
    throw new HttpException(ImageErrorMessages.removeOne, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async createOne(file: Buffer, options: IOptions): Promise<string> {
    const {public_id, secure_url}: UploadApiResponse|UploadApiErrorResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          allowed_formats: ['svg', 'jpeg', 'png'],
          resource_type: 'image',
          ...options,
        },
        (error, result) => {
          if(error) return reject(error);
          resolve(result);
        }
      ).end(file);
    });
    if(public_id && secure_url) {
      const {_id} = await this.imageModel.create({
        id: public_id,
        url: secure_url,
      });
      return _id;
    }
    throw new HttpException(ImageErrorMessages.createOne, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async updateOne(id: string, file: Buffer, options: IOptions): Promise<string> {
    const image = await this.findOne(id);
    const {public_id, secure_url}: UploadApiResponse|UploadApiErrorResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          allowed_formats: ['svg', 'jpeg', 'png'],
          resource_type: 'image',
          ...options,
        },
        (error, result) => {
          if(error) return reject(error);
          resolve(result);
        }
      ).end(file);
    });
    if(public_id && secure_url) {
      const {result} = await cloudinary.uploader.destroy(image.id);
      if(result === 'ok') {
        await this.imageModel.updateOne({_id: id}, {
          id: public_id,
          url: secure_url,
        });
        return ImageSuccessMessages.updateOne;
      }
    }
    throw new HttpException(ImageErrorMessages.removeOne, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}