import mongoose from 'mongoose';
import {Collections} from '../../../configs/collections';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

@Schema()
export class Card {
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
    type: Number,
  })
    balance: number;
  
  @Prop({
    required: true,
    type: String,
  })
    currency: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId, 
    ref: Collections.users, 
  })
    ownerId: string;

  @Prop({
    required: true,
    type: Number,
  })
    startBalance: number;
}

export const CardSchema = SchemaFactory.createForClass(Card);