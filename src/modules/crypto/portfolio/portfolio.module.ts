import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {PortfolioService} from './portfolio.service';
import {CommonModule} from '../../common/common.module';
import {Collections} from '../../../configs/collections';
import {PortfolioController} from './portfolio.controller';
import {PortfolioSchema} from './schemas/portfolio.schema';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    MongooseModule.forFeature([{name: Collections.portfolios, schema: PortfolioSchema}]),
  ],
  exports: [PortfolioService],
  providers: [PortfolioService],
  controllers: [PortfolioController],
})
export class PortfolioModule {}
