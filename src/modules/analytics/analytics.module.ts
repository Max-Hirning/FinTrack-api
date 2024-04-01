import {Module} from '@nestjs/common';
import {CardModule} from '../card/card.module';
import {CommonModule} from '../common/common.module';
import {AnalyticsController} from './analytics.controller';
import {TransactionModule} from '../transaction/transaction.module';

@Module({
  imports: [
    CardModule,
    CommonModule,
    TransactionModule,
  ],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
