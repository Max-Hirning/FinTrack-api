import mongoose, {Document} from 'mongoose';
import {Collections} from '@/configs/collections';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

@Schema()
export class Balance extends Document {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId, 
    ref: Collections.balances, 
  })
    cardId: string;

  @Prop({
    required: true,
    type: String,
  })
    date: string;

  @Prop({
    required: true,
    type: Number,
  })
    balance: number;
}

export const BalanceSchema = SchemaFactory.createForClass(Balance);