import {Types} from 'mongoose';
import {AuthGuard} from '../../auth/guards/auth.guard';
import {TransactionService} from './transaction.service';
import {CommonService} from '../../common/common.service';
import {IPagintaion} from '../../../types/pagination.types';
import {IUpdateTransaction} from './types/transaction.types';
import {CreateTransactionDto} from './dto/create-transaction.dto';
import {UpdateTransactionDto} from './dto/update-transaction.dto';
import {ICustomRequest, IResponse} from '../../../types/app.types';
import {TransactionSuccessMessages} from '../../../configs/messages/transaction';
import {IFilters, ITransactionList, ITransactionResponse} from './types/transaction.types';
import {Controller, Get, Post, Body, Put, Param, Delete, HttpStatus, Query, HttpException, Request, UseGuards} from '@nestjs/common';

@UseGuards(AuthGuard)
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly commonService: CommonService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get()
  async findMany(
    @Query('date') date?: string,
    @Query('page') page?: string,
    @Query('cards') cards?: string, 
    @Query('perPage') perPage?: string,
    @Query('onlyIncomes') onlyIncomes?: string, 
    @Query('onlyExpenses') onlyExpenses?: string, 
  ): Promise<IResponse<IPagintaion<ITransactionList>>> {
    if(!cards) throw new HttpException('Cards are required', HttpStatus.BAD_REQUEST); 
    const filters: Partial<IFilters> = {
      cards: JSON.parse(cards).map((el: string) => new Types.ObjectId(el))
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
    const response = await this.transactionService.findMany(filters);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: TransactionSuccessMessages.findMany,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<ITransactionResponse>> {
    const response = await this.transactionService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: TransactionSuccessMessages.findOne,
    });
  }

  @Delete(':id')
  async removeOne(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<undefined>> {
    const transaction = await this.commonService.findOneTransactionAPI('_id', id);
    const card = await this.commonService.findOneCardAPI('_id', transaction.cardId);
    if(req._id === card.ownerId.toString() || req.role === 'Admin') {
      await this.commonService.updateCardBalance(transaction.cardId, this.commonService.calculateBalance(transaction.amount, true, card.balance, transaction.amount));
      const response = await this.transactionService.removeOne(id);
      return ({
        message: response,
        statusCode: HttpStatus.OK,
      });
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Post()
  async createOne(@Request() req: ICustomRequest, @Body() createTransactionDto: CreateTransactionDto): Promise<IResponse<undefined>> {
    if(new Date(createTransactionDto.date) > new Date()) throw new HttpException('You can not add future transaction', HttpStatus.BAD_REQUEST);
    if(createTransactionDto.amount === 0) throw new HttpException('Amount must not be equal 0', HttpStatus.BAD_REQUEST);
    const card = await this.commonService.findOneCardAPI('_id', createTransactionDto.cardId);
    if(req._id !== card.ownerId.toString()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const category = await this.commonService.findOneCategoryAPI('_id', createTransactionDto.categoryId);
    if(!createTransactionDto.description || createTransactionDto.description === '') createTransactionDto.description = category.title;
    await this.commonService.updateCardBalance(createTransactionDto.cardId, this.commonService.calculateBalance(createTransactionDto.amount, false, card.balance, createTransactionDto.amount));
    const response = await this.transactionService.createOne({
      cardId: createTransactionDto.cardId,
      amount: createTransactionDto.amount,
      categoryId: createTransactionDto.categoryId,
      description: createTransactionDto.description,
      date: createTransactionDto.date || new Date().toISOString(),
    });
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put(':id')
  async updateOne(@Request() req: ICustomRequest, @Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto): Promise<IResponse<undefined>> {
    const transaction = await this.commonService.findOneTransactionAPI('_id', id);
    const card = await this.commonService.findOneCardAPI('_id', transaction.cardId);
    if(req._id !== card.ownerId.toString()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    if(transaction.cardId.toString() !== updateTransactionDto.cardId) {
      const transaction = await this.commonService.findOneTransactionAPI('_id', id);
      const prevCard = await this.commonService.findOneCardAPI('_id', transaction.cardId);
      await this.commonService.updateCardBalance(prevCard._id.toString(), this.commonService.calculateBalance(transaction.amount, true, prevCard.balance, transaction.amount));
      const newCard = await this.commonService.findOneCardAPI('_id', updateTransactionDto.cardId);
      await this.commonService.updateCardBalance(newCard._id.toString(), this.commonService.calculateBalance(transaction.amount, false, newCard.balance, transaction.amount));
      await this.transactionService.updateOne(id, {cardId: updateTransactionDto.cardId});
    }
    if(transaction.amount !== updateTransactionDto.amount) {
      if(updateTransactionDto.amount === 0) throw new HttpException('Amount must not be equal 0', HttpStatus.NOT_FOUND);
      const transaction = await this.commonService.findOneTransactionAPI('_id', id);
      const card = await this.commonService.findOneCardAPI('_id', transaction.cardId);
      const prevCardAmount = this.commonService.calculateBalance(transaction.amount, true, card.balance, transaction.amount);
      await this.commonService.updateCardBalance(card._id.toString(), prevCardAmount);
      await this.commonService.updateCardBalance(card._id.toString(), this.commonService.calculateBalance(updateTransactionDto.amount, false, prevCardAmount, updateTransactionDto.amount));
      await this.transactionService.updateOne(id, {amount: updateTransactionDto.amount});
    }
    const updateTransaction: IUpdateTransaction = {};
    if(updateTransactionDto.date !== transaction.date) updateTransaction.date = updateTransactionDto.date;
    if(updateTransactionDto.categoryId !== transaction.categoryId.toString()) updateTransaction.categoryId = updateTransactionDto.categoryId;
    if(updateTransactionDto.description && updateTransactionDto.description !== '' && transaction.description !== updateTransactionDto.description) updateTransaction.description = updateTransactionDto.description;
    const response = await this.transactionService.updateOne(id, updateTransaction);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
