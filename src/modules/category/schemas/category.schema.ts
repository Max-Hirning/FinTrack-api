import mongoose, {Document} from 'mongoose';
import {Collections} from '../../../configs/collections';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

@Schema()
export class Category extends Document {
  @Prop({
    required: false,
    type: [String],
    default: [],
  })
    mcc: string;

  @Prop({
    required: true,
    type: String,
  })
    title: string;

  @Prop({
    required: true,
    type: String,
  })
    color: string;
  
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.images
  })
    imageId: string;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId, 
    ref: Collections.categories
  })
    parentId: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);