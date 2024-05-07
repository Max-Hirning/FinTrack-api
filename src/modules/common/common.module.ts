import {Module} from '@nestjs/common';
import {CommonService} from './common.service';
import {MongooseModule} from '@nestjs/mongoose';
import {Collections} from '../../configs/collections';
import {UserSchema} from '../user/schemas/user.schema';
import {CardSchema} from '../finance/card/schemas/card.schema';
import {CategorySchema} from '../category/schemas/category.schema';
import {PortfolioSchema} from '../crypto/portfolio/schemas/portfolio.schema';
import {TransactionSchema} from '../finance/transaction/schemas/transaction.schema';
import {PortfolioTransactionSchema} from '../crypto/portfolio-transaction/schemas/portfolio-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
    MongooseModule.forFeature([{name: Collections.cards, schema: CardSchema}]),
    MongooseModule.forFeature([{name: Collections.categories, schema: CategorySchema}]),
    MongooseModule.forFeature([{name: Collections.portfolios, schema: PortfolioSchema}]),
    MongooseModule.forFeature([{name: Collections.transactions, schema: TransactionSchema}]),
    MongooseModule.forFeature([{name: Collections.portfolioTransactions, schema: PortfolioTransactionSchema}]),
  ],
  exports: [CommonService],
  providers: [CommonService],
})
export class CommonModule {}
