import mongoose from 'mongoose';
import {Collections} from '@configs/collections';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

@Schema()
export class Transaction {
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
    type: mongoose.Schema.Types.ObjectId, 
    ref: Collections.categories, 
  })
    categoryId: string;

  @Prop({
    required: true,
    type: String,
  })
    description: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId, 
    ref: Collections.cards, 
  })
    cardId: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);