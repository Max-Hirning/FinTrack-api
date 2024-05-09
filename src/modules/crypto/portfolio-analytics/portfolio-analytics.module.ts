import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {CommonModule} from 'modules/common/common.module';
import {PortfolioModule} from '../portfolio/portfolio.module';
import {PortfolioAnalyticsController} from './portfolio-analytics.controller';
import {PortfolioTransactionModule} from '../portfolio-transaction/portfolio-transaction.module';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    PortfolioModule,
    PortfolioTransactionModule,
  ],
  controllers: [PortfolioAnalyticsController],
})
export class PortfolioAnalyticsModule {}
