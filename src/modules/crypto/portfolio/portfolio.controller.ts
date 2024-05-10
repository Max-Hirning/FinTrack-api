import {Types} from 'mongoose';
import {PortfolioService} from './portfolio.service';
import {AuthGuard} from '../../auth/guards/auth.guard';
import {CommonService} from '../../common/common.service';
import {toFixedWithoutRounding} from '../../../utils/math';
import {CreatePortfolioDto} from './dto/create-portfolio.dto';
import {UpdatePortfolioDto} from './dto/update-portfolio.dto';
import {ICustomRequest, IResponse} from '../../../types/app.types';
import {PortfolioSuccessMessages} from '../../../configs/messages/portfolio';
import {PortfolioTransactionService} from '../portfolio-transaction/portfolio-transaction.service';
import {Controller, Get, Post, Body, Param, Delete, Request, UseGuards, HttpException, HttpStatus, Put} from '@nestjs/common';
import {IAsset, IPortfolioResponse, IPortfolioResponseListWithCurrencies, IPortfolioResponseWithBalance, IPortfolioResponseWithCurrencies, IUpdatePortfolio} from './types/portfolio.types';

@UseGuards(AuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(
    private readonly commonService: CommonService,
    private readonly portfolioService: PortfolioService,
    private readonly portfolioTransactionService: PortfolioTransactionService,
  ) {}


  @Delete(':id')
  async removeOne(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<undefined>> {
    const portfolio = await this.commonService.findOnePortfolioAPI('_id', id);
    if(req._id === portfolio.ownerId.toString() || req.role === 'Admin') {
      await this.portfolioTransactionService.removeMany(id); // delete all portfolio transactions
      const response = await this.portfolioService.removeOne(id);
      return ({
        message: response,
        statusCode: HttpStatus.OK,
      });
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<IPortfolioResponseWithCurrencies<IPortfolioResponseWithBalance>>> {
    const {portfolio, currencies} = await this.portfolioService.findOne(id);
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(currencies.map((el: string) => `${el}USDT`))}&type=MINI`);
    const result = await response.json();
    const balance = Object.values(portfolio.assets).reduce((res: number, el: IAsset): number => {
      const currency: {symbol: string, lastPrice: string} = result.find(({symbol}: {symbol: string, lastPrice: string}) => symbol === `${el.asset}USDT`);
      res += +(currency.lastPrice) * el.amount;
      return res;
    }, 0);
    return ({
      data: {
        portfolio: {
          ...portfolio,
          currency: 'USDT',
          balance: toFixedWithoutRounding(balance, 2),
        },
        currencies,
      },
      statusCode: HttpStatus.OK,
      message: PortfolioSuccessMessages.findOne,
    });
  }

  @Post()
  async createOne(@Request() req: ICustomRequest, @Body() createPortfolioDto: CreatePortfolioDto): Promise<IResponse<undefined>> {
    if(req._id !== createPortfolioDto.ownerId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    await this.commonService.findOneUserAPI('_id', createPortfolioDto.ownerId);
    const response = await this.portfolioService.createOne({
      title: createPortfolioDto.title,
      color: createPortfolioDto.color,
      ownerId: createPortfolioDto.ownerId,
    });
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Get('owner/:id')
  async findMany(@Param('id') id: string): Promise<IResponse<IPortfolioResponseListWithCurrencies<IPortfolioResponseWithBalance>>> {
    const {currencies, portfolios} = await this.portfolioService.findMany({ownerId: new Types.ObjectId(id)});
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(currencies.map((el: string) => `${el}USDT`))}&type=MINI`);
    const result = await response.json();
    const portfoliosWithBalances = portfolios.map((portfolio: IPortfolioResponse) => {
      const balance = Object.values(portfolio.assets).reduce((res: number, el: IAsset): number => {
        const currency: {symbol: string, lastPrice: string} = result.find(({symbol}: {symbol: string, lastPrice: string}) => symbol === `${el.asset}USDT`);
        res += +(currency.lastPrice) * el.amount;
        return res;
      }, 0);
      return ({...portfolio, currency: 'USDT', balance: toFixedWithoutRounding(balance, 2)});
    });
    return ({
      data: {
        currencies,
        portfolios: portfoliosWithBalances, 
      },
      statusCode: HttpStatus.OK,
      message: PortfolioSuccessMessages.findMany,
    });
  }

  @Put(':id')
  async updateOne(@Request() req: ICustomRequest, @Param('id') id: string, @Body() updatePortfolioDto: UpdatePortfolioDto): Promise<IResponse<undefined>> {
    const portfolio = await this.commonService.findOnePortfolioAPI('_id', id);
    if(req._id !== portfolio.ownerId.toString()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const updatePortfolio: IUpdatePortfolio = {};
    if(updatePortfolioDto.color) updatePortfolio.color = updatePortfolioDto.color;
    if(updatePortfolioDto.title) updatePortfolio.title = updatePortfolioDto.title;
    const response = await this.portfolioService.updateOne(id, updatePortfolio);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
