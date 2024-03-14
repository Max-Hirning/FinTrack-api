import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {BalanceService} from './balance.service';
import {Collections} from '@/configs/collections';
import {BalanceController} from './balance.controller';
import {BalanceSchema} from './schemas/balance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Collections.balances, schema: BalanceSchema}]),
  ],
  exports: [BalanceService],
  providers: [BalanceService],
  controllers: [BalanceController],
})
export class BalanceModule {}
