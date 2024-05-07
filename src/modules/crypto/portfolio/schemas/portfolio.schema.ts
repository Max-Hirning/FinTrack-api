import mongoose from 'mongoose';
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
    required: true,
    type: [
      {
        asset: String,
        amount: Number,
        avgBuyPrice: Number,
      }
    ],
    default: [],
  })
    assets: { asset: string, avgBuyPrice: number, amount: number }[];
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);