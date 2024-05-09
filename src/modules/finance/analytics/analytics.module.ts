import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {CommonModule} from '../../common/common.module';
import {CardModule} from '../../finance/card/card.module';
import {AnalyticsController} from './analytics.controller';
import {TransactionModule} from '../../finance/transaction/transaction.module';

@Module({
  imports: [
    JwtModule,
    CardModule,
    CommonModule,
    TransactionModule,
  ],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
