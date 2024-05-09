import {Types} from 'mongoose';
import {toFixedWithoutRounding} from 'utils/math';
import {IPagintaion} from 'types/pagination.types';
import {AuthGuard} from 'modules/auth/guards/auth.guard';
import {IResponse, ICustomRequest} from 'types/app.types';
import {CommonService} from 'modules/common/common.service';
import {TransactionSuccessMessages} from 'configs/messages/transaction';
import {PortfolioTransactionService} from './portfolio-transaction.service';
import {CreatePortfolioTransactionDto} from './dto/create-portfolio-transaction.dto';
import {UpdatePortfolioTransactionDto} from './dto/update-portfolio-transaction.dto';
import {IPortfolioTransactionResponse, IFilters, IUpdatePortfolioTransaction} from './types/portfolio-transaction.types';
import {Controller, Get, Post, Body, Put, Param, Request, Delete, HttpException, HttpStatus, Query, UseGuards} from '@nestjs/common';

@UseGuards(AuthGuard)
@Controller('portfolio-transaction')
export class PortfolioTransactionController {
  constructor(
    private readonly commonService: CommonService,
    private readonly portfolioTransactionService: PortfolioTransactionService,
  ) {}

  @Get()
  async findMany(
    @Query('date') date?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('portfolios') portfolios?: string, 
    @Query('onlyIncomes') onlyIncomes?: string, 
    @Query('onlyExpenses') onlyExpenses?: string, 
  ): Promise<IResponse<IPagintaion<IPortfolioTransactionResponse[]>>> {
    if(!portfolios) throw new HttpException('Portfolios are required', HttpStatus.BAD_REQUEST); 
    const filters: Partial<IFilters> = {
      portfolios: JSON.parse(portfolios).map((el: string) => new Types.ObjectId(el))
    };
    if(date) {
      const dates = JSON.parse(date);
      filters.date = {
        $gte: new Date(dates[0]).toISOString(),
        $lte: new Date(dates[1]).toISOString()
      };
    }
    if(onlyIncomes) {
      if(JSON.parse(onlyIncomes)) {
        filters.amount = {$gt: 0};
      }
    }
    if(onlyExpenses) {
      if(JSON.parse(onlyExpenses)) {
        filters.amount = {$lt: 0};
      }
    }
    if(page && perPage) {
      filters.page = +page;
      filters.perPage = +perPage;
    }
    const response = await this.portfolioTransactionService.findMany(filters);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: TransactionSuccessMessages.findMany,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<IPortfolioTransactionResponse>> {
    const response = await this.portfolioTransactionService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: TransactionSuccessMessages.findOne,
    });
  }

  @Delete(':id')
  async removeOne(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<undefined>> {
    const portfolioTransaction = await this.commonService.findOnePortfolioTransactionAPI('_id', id);
    const portfolio = await this.commonService.findOnePortfolioAPI('_id', portfolioTransaction.portfolioId);
    if(req._id === portfolio.ownerId.toString() || req.role === 'Admin') {
      const asset = portfolio.assets[portfolioTransaction.asset];
      const newAmount = asset.amount - portfolioTransaction.amount;
      const newAvgBuyPrice = ((asset.avgBuyPrice * asset.amount) - (portfolioTransaction.price * portfolioTransaction.amount)) / newAmount;
      await this.commonService.updatePortfolioAssets(portfolio._id.toString(), asset.asset, {
        amount: newAmount,
        asset: asset.asset,
        avgBuyPrice: toFixedWithoutRounding(newAvgBuyPrice, 2),
      });
      const response = await this.portfolioTransactionService.removeOne(id);
      return ({
        message: response,
        statusCode: HttpStatus.OK,
      });
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Post()
  async createOne(@Request() req: ICustomRequest, @Body() createPortfolioTransactionDto: CreatePortfolioTransactionDto): Promise<IResponse<undefined>> {
    if(new Date(createPortfolioTransactionDto.date) > new Date()) throw new HttpException('You can not add future transaction', HttpStatus.BAD_REQUEST);
    if(createPortfolioTransactionDto.amount === 0) throw new HttpException('Amount must not be equal 0', HttpStatus.BAD_REQUEST);
    if(createPortfolioTransactionDto.price === 0) throw new HttpException('Price must not be equal 0', HttpStatus.BAD_REQUEST);
    const portfolio = await this.commonService.findOnePortfolioAPI('_id', createPortfolioTransactionDto.portfolioId);
    if(req._id !== portfolio.ownerId.toString()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    if(!createPortfolioTransactionDto.description || createPortfolioTransactionDto.description === '') {
      if(createPortfolioTransactionDto.amount > 0) {
        createPortfolioTransactionDto.description = `Bought ${createPortfolioTransactionDto.asset}`;
      } else {
        createPortfolioTransactionDto.description = `Sold ${createPortfolioTransactionDto.asset}`;
      }
    }
    const asset = portfolio.assets[createPortfolioTransactionDto.asset];
    if(asset) {
      let newAmount = 0, newAvgBuyPrice = 0;
      if(createPortfolioTransactionDto.amount > 0) {
        newAmount = asset.amount + createPortfolioTransactionDto.amount;
        newAvgBuyPrice = ((asset.amount * asset.avgBuyPrice) + (Math.abs(createPortfolioTransactionDto.amount) * createPortfolioTransactionDto.price)) / newAmount;
      } else {
        if(Math.abs(createPortfolioTransactionDto.amount) > asset.amount) throw new HttpException(`You don't have enough ${asset.asset} to sell`, HttpStatus.BAD_REQUEST);
        newAmount = asset.amount + createPortfolioTransactionDto.amount;
        newAvgBuyPrice = ((asset.amount * asset.avgBuyPrice) - (Math.abs(createPortfolioTransactionDto.amount) * createPortfolioTransactionDto.price)) / newAmount;
      }
      await this.commonService.updatePortfolioAssets(portfolio._id.toString(), asset.asset, {
        amount: newAmount,
        asset: asset.asset,
        avgBuyPrice: toFixedWithoutRounding(newAvgBuyPrice, 2),
      });
    } else {
      if(createPortfolioTransactionDto.amount > 0) {
        await this.commonService.updatePortfolioAssets(portfolio._id.toString(), createPortfolioTransactionDto.asset, {
          asset: createPortfolioTransactionDto.asset,
          amount: createPortfolioTransactionDto.amount,
          avgBuyPrice: toFixedWithoutRounding(createPortfolioTransactionDto.price, 2)
        });
      } else {
        // eslint-disable-next-line quotes
        throw new HttpException("You can't sell what you don't have", HttpStatus.BAD_REQUEST);
      }
    }
    const response = await this.portfolioTransactionService.createOne({
      date: createPortfolioTransactionDto.date,
      price: createPortfolioTransactionDto.price,
      asset: createPortfolioTransactionDto.asset,
      amount: createPortfolioTransactionDto.amount,
      portfolioId: createPortfolioTransactionDto.portfolioId,
      description: createPortfolioTransactionDto.description,
    });
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put(':id')
  async updateOne(@Request() req: ICustomRequest, @Param('id') id: string, @Body() updatePortfolioTransactionDto: UpdatePortfolioTransactionDto): Promise<IResponse<undefined>> {
    const portfolioTransaction = await this.commonService.findOnePortfolioTransactionAPI('_id', id);
    const portfolio = await this.commonService.findOnePortfolioAPI('_id', portfolioTransaction.portfolioId);
    if(req._id !== portfolio.ownerId.toString()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    if(updatePortfolioTransactionDto.price && portfolioTransaction.price !== updatePortfolioTransactionDto.price) {
      const portfolioTransaction = await this.commonService.findOnePortfolioTransactionAPI('_id', id);
      const portfolio = await this.commonService.findOnePortfolioAPI('_id', portfolioTransaction.portfolioId);
      const asset = portfolio.assets[portfolioTransaction.asset];
      let newAmount = 0, newAvgBuyPrice = 0;
      const oldAmount = asset.amount - portfolioTransaction.amount;
      const oldAvgBuyPrice = toFixedWithoutRounding((((asset.avgBuyPrice * asset.amount) - (portfolioTransaction.price * portfolioTransaction.amount)) / oldAmount), 2);
      if(portfolioTransaction.amount > 0) {
        newAmount = oldAmount + portfolioTransaction.amount;
        newAvgBuyPrice = ((oldAmount * oldAvgBuyPrice) + (Math.abs(portfolioTransaction.amount) * updatePortfolioTransactionDto.price)) / newAmount;
      } else {
        if(Math.abs(portfolioTransaction.amount) > asset.amount) throw new HttpException(`You don't have enough ${asset.asset} to sell`, HttpStatus.BAD_REQUEST);
        newAmount = oldAmount + portfolioTransaction.amount;
        newAvgBuyPrice = ((oldAmount * oldAvgBuyPrice) - (Math.abs(portfolioTransaction.amount) * updatePortfolioTransactionDto.price)) / newAmount;
      }
      await this.commonService.updatePortfolioAssets(portfolio._id.toString(), asset.asset, {
        amount: newAmount,
        asset: asset.asset,
        avgBuyPrice: toFixedWithoutRounding(newAvgBuyPrice, 2),
      });
      await this.portfolioTransactionService.updateOne(id, {price: updatePortfolioTransactionDto.price});
    }
    if(updatePortfolioTransactionDto.amount && portfolioTransaction.amount !== updatePortfolioTransactionDto.amount) {
      const portfolioTransaction = await this.commonService.findOnePortfolioTransactionAPI('_id', id);
      const portfolio = await this.commonService.findOnePortfolioAPI('_id', portfolioTransaction.portfolioId);
      const asset = portfolio.assets[portfolioTransaction.asset];
      let newAmount = 0, newAvgBuyPrice = 0;
      const oldAmount = asset.amount - portfolioTransaction.amount;
      const oldAvgBuyPrice = toFixedWithoutRounding((((asset.avgBuyPrice * asset.amount) - (portfolioTransaction.price * portfolioTransaction.amount)) / oldAmount), 2);
      if(updatePortfolioTransactionDto.amount > 0) {
        newAmount = oldAmount + updatePortfolioTransactionDto.amount;
        newAvgBuyPrice = ((oldAmount * oldAvgBuyPrice) + (Math.abs(updatePortfolioTransactionDto.amount) * portfolioTransaction.price)) / newAmount;
      } else {
        if(Math.abs(updatePortfolioTransactionDto.amount) > asset.amount) throw new HttpException(`You don't have enough ${asset.asset} to sell`, HttpStatus.BAD_REQUEST);
        newAmount = oldAmount + updatePortfolioTransactionDto.amount;
        newAvgBuyPrice = ((oldAmount * oldAvgBuyPrice) - (Math.abs(updatePortfolioTransactionDto.amount) * portfolioTransaction.price)) / newAmount;
      }
      await this.commonService.updatePortfolioAssets(portfolio._id.toString(), asset.asset, {
        amount: newAmount,
        asset: asset.asset,
        avgBuyPrice: toFixedWithoutRounding(newAvgBuyPrice, 2),
      });
      await this.portfolioTransactionService.updateOne(id, {amount: updatePortfolioTransactionDto.amount});
    }
    const updatePortfolioTransaction: IUpdatePortfolioTransaction = {};
    if(updatePortfolioTransactionDto.date !== portfolioTransaction.date) updatePortfolioTransaction.date = updatePortfolioTransactionDto.date;
    if(updatePortfolioTransactionDto.description && updatePortfolioTransactionDto.description !== '' && portfolioTransaction.description !== updatePortfolioTransactionDto.description) updatePortfolioTransaction.description = updatePortfolioTransactionDto.description;
    const response = await this.portfolioTransactionService.updateOne(id, updatePortfolioTransaction);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
