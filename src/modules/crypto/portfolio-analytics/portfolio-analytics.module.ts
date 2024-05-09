import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {PortfolioModule} from '../portfolio/portfolio.module';
import {PortfolioAnalyticsController} from './portfolio-analytics.controller';

@Module({
  imports: [
    JwtModule,
    PortfolioModule,
  ],
  controllers: [PortfolioAnalyticsController],
})
export class PortfolioAnalyticsModule {}
