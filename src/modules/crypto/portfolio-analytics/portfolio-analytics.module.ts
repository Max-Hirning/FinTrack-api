import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {CommonModule} from '../../common/common.module';
import {PortfolioModule} from '../portfolio/portfolio.module';
import {PortfolioAnalyticsController} from './portfolio-analytics.controller';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    PortfolioModule,
  ],
  controllers: [PortfolioAnalyticsController],
})
export class PortfolioAnalyticsModule {}
