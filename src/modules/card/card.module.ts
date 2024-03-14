import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {CardService} from './card.service';
import {MongooseModule} from '@nestjs/mongoose';
import {CardSchema} from './schemas/card.schema';
import {CardController} from './card.controller';
import {Collections} from '@/configs/collections';
import {CommonModule} from '@commonModule/common.module';
import {TransactionModule} from '../transaction/transaction.module';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    TransactionModule,
    MongooseModule.forFeature([{name: Collections.cards, schema: CardSchema}]),
  ],
  exports: [CardService],
  providers: [CardService],
  controllers: [CardController],
})
export class CardModule {}
