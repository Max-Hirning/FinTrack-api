import mongoose from 'mongoose';
import {IAsset} from '../types/portfolio.types';
import {Collections} from '../../../../configs/collections';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

@Schema()
export class Portfolio {
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
    ref: Collections.users, 
  })
    ownerId: string;

  @Prop({ 
    required: false,
    type: Object,
    default: {},
  })
    assets: {[key: string]: IAsset};
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);