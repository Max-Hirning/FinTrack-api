import mongoose from 'mongoose';
import {Collections} from 'src/configs/collections';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Image} from 'src/modules/image/schemas/image.schema';

@Schema()
export class User {
  @Prop({
    required: false,
    type: String,
    default: new Date().toISOString(),
  })
    date: string;

  @Prop({
    required: true,
    type: String,
  })
    email: string;

  @Prop({
    required: true,
    type: String,
  })
    lastName: string;

  @Prop({
    required: true,
    type: String,
  })
    password: string;

  @Prop({
    required: true,
    type: String,
  })
    firstName: string;

  @Prop({
    required: false,
    type: String,
    default: 'USD',
  })
    currency: string;

  @Prop({
    required: false,
    type: Number,
    default: 0.1,
  })
    version: number;

  @Prop({
    required: false, 
    type: mongoose.Schema.Types.ObjectId, 
    default: null,
    ref: Collections.images
  })
    imageId: Image['_id'];
}

export const UserSchema = SchemaFactory.createForClass(User);