import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {CommonModule} from '../../common/common.module';
import {Collections} from '../../../configs/collections';
import {PortfolioTransactionService} from './portfolio-transaction.service';
import {TransactionModule} from '../../finance/transaction/transaction.module';
import {PortfolioTransactionController} from './portfolio-transaction.controller';
import {PortfolioTransactionSchema} from './schemas/portfolio-transaction.schema';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    TransactionModule,
    MongooseModule.forFeature([{name: Collections.portfolioTransactions, schema: PortfolioTransactionSchema}]),
  ],
  providers: [PortfolioTransactionService],
  controllers: [PortfolioTransactionController],
})
export class PortfolioTransactionModule {}
