import {Types} from 'mongoose';
import {IResponse} from 'types/app.types';
import {toFixedWithoutRounding} from 'utils/math';
import {CommonService} from 'modules/common/common.service';
import {PortfolioService} from '../portfolio/portfolio.service';
import {AnalyticsSuccessMessages} from 'configs/messages/analytics';
import {IAsset, IPortfolioResponse} from '../portfolio/types/portfolio.types';
import {Controller, Get, Query, HttpStatus, HttpException} from '@nestjs/common';
import {PortfolioTransactionService} from '../portfolio-transaction/portfolio-transaction.service';

@Controller('portfolio-analytics')
export class PortfolioAnalyticsController {
  constructor(
    private readonly commonService: CommonService,
    private readonly portfolioService: PortfolioService,
    private readonly portfolioTransactionService: PortfolioTransactionService,
  ) {}

  @Get('assets')
  async findPortfolioAssets(
    @Query('ownerId') ownerId?: string,
    @Query('portfolioId') portfolioId?: string,
  ): Promise<IResponse<IAsset[]>> {
    if(ownerId) {
      const portfolios = await this.portfolioService.findMany({ownerId: new Types.ObjectId(ownerId)});
      const response = {};
      portfolios.map(({assets}: IPortfolioResponse) => {
        Object.values(assets).map((el: IAsset) => {
          const asset = response[el.asset];
          if(asset) {
            const newAmount = asset.amount + el.amount;
            const newAvgBuyPrice = ((asset.amount * asset.avgBuyPrice) + (Math.abs(el.amount) * el.avgBuyPrice)) / newAmount;
            response[el.asset].amount = newAmount;
            response[el.asset].avgBuyPrice = toFixedWithoutRounding(newAvgBuyPrice, 2);
          } else {
            response[el.asset] = el;
          }
        });
      });
      return ({
        statusCode: HttpStatus.OK,
        data: Object.values(response),
        message: AnalyticsSuccessMessages.calculate,
      });
    }
    if(portfolioId) {
      const response = await this.portfolioService.findOne(portfolioId);
      return ({
        statusCode: HttpStatus.OK,
        data: Object.values(response.assets),
        message: AnalyticsSuccessMessages.calculate,
      });
    }
    throw new HttpException('OwnerId or portfolioId is required', HttpStatus.BAD_REQUEST);
  }
}
