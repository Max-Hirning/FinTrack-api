import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {CommonModule} from '../../common/common.module';
import {Collections} from '../../../configs/collections';
import {TransactionService} from './transaction.service';
import {TransactionController} from './transaction.controller';
import {TransactionSchema} from './schemas/transaction.schema';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    MongooseModule.forFeature([{name: Collections.transactions, schema: TransactionSchema}]),
  ],
  exports: [TransactionService],
  providers: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
