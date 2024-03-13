import {Document} from 'mongoose';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

@Schema()
export class Image extends Document {
  @Prop({
    required: true
  })
    id: string;

  @Prop({
    required: true
  })
    url: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);