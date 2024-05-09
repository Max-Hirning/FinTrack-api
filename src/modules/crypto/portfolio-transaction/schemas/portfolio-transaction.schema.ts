import mongoose from 'mongoose';
import {Collections} from '../../../../configs/collections';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

@Schema()
export class PortfolioTransaction {
  @Prop({
    required: true,
    type: String,
  })
    date: string;

  @Prop({
    required: true,
    type: Number,
  })
    amount: number;

  @Prop({
    required: true,
    type: String,
  })
    asset: string;

  @Prop({
    required: true,
    type: Number,
  })
    price: number;

  @Prop({
    required: true,
    type: String,
  })
    description: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId, 
    ref: Collections.portfolios, 
  })
    portfolioId: string;
}

export const PortfolioTransactionSchema = SchemaFactory.createForClass(PortfolioTransaction);