import {Types} from 'mongoose';
import {PortfolioService} from './portfolio.service';
import {AuthGuard} from '../../auth/guards/auth.guard';
import {CommonService} from '../../common/common.service';
import {CreatePortfolioDto} from './dto/create-portfolio.dto';
import {UpdatePortfolioDto} from './dto/update-portfolio.dto';
import {ICustomRequest, IResponse} from '../../../types/app.types';
import {PortfolioSuccessMessages} from '../../../configs/messages/portfolio';
import {IPortfolioResponse, IUpdatePortfolio} from './types/portfolio.types';
import {PortfolioTransactionService} from '../portfolio-transaction/portfolio-transaction.service';
import {Controller, Get, Post, Body, Param, Delete, Request, UseGuards, HttpException, HttpStatus, Put} from '@nestjs/common';

@UseGuards(AuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(
    private readonly commonService: CommonService,
    private readonly portfolioService: PortfolioService,
    private readonly portfolioTransactionService: PortfolioTransactionService,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<IPortfolioResponse>> {
    const response = await this.portfolioService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: PortfolioSuccessMessages.findOne,
    });
  }

  @Get('owner/:id')
  async findMany(@Param('id') id: string): Promise<IResponse<IPortfolioResponse[]>> {
    const response = await this.portfolioService.findMany({ownerId: new Types.ObjectId(id)});
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: PortfolioSuccessMessages.findMany,
    });
  }

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
