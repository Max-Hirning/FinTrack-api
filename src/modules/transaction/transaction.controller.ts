import {Types} from 'mongoose';
import {IPagintaion, IResponse} from '@/types/app.types';
import {TransactionService} from './transaction.service';
import {CommonService} from '@commonModule/common.service';
import {IUpdateTransaction} from './types/transaction.types';
import {TransactionSuccessMessages} from '@messages/transaction';
import {CreateTransactionDto} from './dto/create-transaction.dto';
import {UpdateTransactionDto} from './dto/update-transaction.dto';
import {IFilters, ITransactionList, ITransactionResponse} from './types/transaction.types';
import {Controller, Get, Post, Body, Put, Param, Delete, HttpStatus, Query, HttpException} from '@nestjs/common';

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

  @Delete(':id')
  async removeOne(@Param('id') id: string): Promise<IResponse<undefined>> {
    const transaction = await this.commonService.findOneTransactionAPI('_id', id);
    const card = await this.commonService.findOneCardAPI('_id', transaction.cardId);
    await this.commonService.updateCardBalance(transaction.cardId, this.commonService.calculateBalance(transaction.amount, true, card.balance, transaction.amount));
    const response = await this.transactionService.removeOne(id);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
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

  @Post()
  async createOne(@Body() createTransactionDto: CreateTransactionDto): Promise<IResponse<undefined>> {
    if(new Date(createTransactionDto.date) > new Date()) throw new HttpException('You can not add future transaction', HttpStatus.BAD_REQUEST);
    if(createTransactionDto.amount === 0) throw new HttpException('Amount must not be equal 0', HttpStatus.BAD_REQUEST);
    const card = await this.commonService.findOneCardAPI('_id', createTransactionDto.cardId);
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
  async updateOne(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto): Promise<IResponse<undefined>> {
    if(updateTransactionDto.cardId) {
      const transaction = await this.commonService.findOneTransactionAPI('_id', id);
      const prevCard = await this.commonService.findOneCardAPI('_id', transaction.cardId);
      await this.commonService.updateCardBalance(prevCard._id.toString(), this.commonService.calculateBalance(transaction.amount, true, prevCard.balance, transaction.amount));
      const newCard = await this.commonService.findOneCardAPI('_id', updateTransactionDto.cardId);
      await this.commonService.updateCardBalance(newCard._id.toString(), this.commonService.calculateBalance(transaction.amount, false, newCard.balance, transaction.amount));
      await this.transactionService.updateOne(id, {cardId: updateTransactionDto.cardId});
    }
    if(updateTransactionDto.amount) {
      if(updateTransactionDto.amount === 0) throw new HttpException('Amount must not be equal 0', HttpStatus.NOT_FOUND);
      const transaction = await this.commonService.findOneTransactionAPI('_id', id);
      const card = await this.commonService.findOneCardAPI('_id', transaction.cardId);
      const prevCardAmount = this.commonService.calculateBalance(transaction.amount, true, card.balance, transaction.amount);
      await this.commonService.updateCardBalance(card._id.toString(), prevCardAmount);
      await this.commonService.updateCardBalance(card._id.toString(), this.commonService.calculateBalance(updateTransactionDto.amount, false, prevCardAmount, updateTransactionDto.amount));
      await this.transactionService.updateOne(id, {amount: updateTransactionDto.amount});
    }
    const updateTransaction: IUpdateTransaction = {};
    if(updateTransactionDto.date) updateTransaction.date = updateTransactionDto.date;
    if(updateTransactionDto.categoryId) updateTransaction.categoryId = updateTransactionDto.categoryId;
    if(updateTransactionDto.description) updateTransaction.description = updateTransactionDto.description;
    const response = await this.transactionService.updateOne(id, updateTransaction);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
