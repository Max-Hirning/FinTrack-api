import {Module} from '@nestjs/common';
import {CommonService} from './common.service';
import {MongooseModule} from '@nestjs/mongoose';
import {Collections} from 'src/configs/collections';
import {UserSchema} from '../user/schemas/user.schema';
import {CardSchema} from '../card/schemas/card.schema';
import {CategorySchema} from '../category/schemas/category.schema';
import {TransactionSchema} from '../transaction/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
    MongooseModule.forFeature([{name: Collections.cards, schema: CardSchema}]),
    MongooseModule.forFeature([{name: Collections.categories, schema: CategorySchema}]),
    MongooseModule.forFeature([{name: Collections.transactions, schema: TransactionSchema}]),
  ],
  exports: [CommonService],
  providers: [CommonService],
})
export class CommonModule {}
