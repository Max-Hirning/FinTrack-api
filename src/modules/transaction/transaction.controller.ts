import {Types} from 'mongoose';
import {IPagintaion, IResponse} from '@/types/app.types';
import {TransactionService} from './transaction.service';
import {CommonService} from '@commonModule/common.service';
import {IBalance} from '@balanceModule/types/balance.types';
import {BalanceService} from '@balanceModule/balance.service';
import {TransactionSuccessMessages} from '@messages/transaction';
import {CreateTransactionDto} from './dto/create-transaction.dto';
import {UpdateTransactionDto} from './dto/update-transaction.dto';
import {IFilters, ITransactionList} from './types/transaction.types';
import {ITransaction, IUpdateTransaction} from './types/transaction.types';
import {Controller, Get, Post, Body, Put, Param, Delete, HttpStatus, Query, HttpException} from '@nestjs/common';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly commonService: CommonService,
    private readonly balanceService: BalanceService,
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
    const balance = await this.commonService.findOneBalanceAPI({
      date: {
        $lte: new Date(transaction.date).toISOString().split('T')[0]
      },
      cardId: transaction.cardId
    }, true);
    if(balance) {
      await this.balanceService.updateOne(balance._id, {balance: balance.balance - transaction.amount});
    }
    const nextBalances = await this.balanceService.findMany({
      date: {
        $gt: new Date(transaction.date).toISOString().split('T')[0]
      },
      cards: [new Types.ObjectId(transaction.cardId)]
    });
    if(nextBalances.length > 0) {
      await this.balanceService.updateMany(nextBalances.map((el: IBalance) => el._id.toString()), ((-1) * transaction.amount));
    }
    await this.commonService.updateCardBalance(transaction.cardId, this.commonService.calculateBalance(transaction.amount, true, card.balance, transaction.amount));
    const response = await this.transactionService.removeOne(id);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<ITransaction>> {
    const response = await this.transactionService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: TransactionSuccessMessages.findOne,
    });
  }

  @Post()
  async createOne(@Body() createTransactionDto: CreateTransactionDto): Promise<IResponse<undefined>> {
    if(createTransactionDto.amount === 0) throw new HttpException('Amount must not be equal 0', HttpStatus.NOT_FOUND);
    const card = await this.commonService.findOneCardAPI('_id', createTransactionDto.cardId);
    const balance = await this.commonService.findOneBalanceAPI({
      date: {
        $lte: new Date(createTransactionDto.date).toISOString().split('T')[0]
      },
      cardId: createTransactionDto.cardId
    }, true);
    if(balance) {
      if(balance.date === new Date(createTransactionDto.date).toISOString().split('T')[0]) {
        await this.balanceService.updateOne(balance._id, {balance: balance.balance + createTransactionDto.amount});
      } else {
        await this.balanceService.createOne({
          cardId: createTransactionDto.cardId,
          balance: balance.balance + createTransactionDto.amount,
          date: new Date(createTransactionDto.date).toISOString().split('T')[0]
        });
      }
    } else {
      await this.balanceService.createOne({
        cardId: createTransactionDto.cardId,
        balance: card.startBalance + createTransactionDto.amount,
        date: new Date(createTransactionDto.date).toISOString().split('T')[0]
      });
    }
    const nextBalances = await this.balanceService.findMany({
      date: {
        $gt: new Date(createTransactionDto.date).toISOString().split('T')[0]
      },
      cards: [new Types.ObjectId(createTransactionDto.cardId)]
    });
    if(nextBalances.length > 0) {
      await this.balanceService.updateMany(nextBalances.map((el: IBalance) => el._id.toString()), createTransactionDto.amount);
    }
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
      const currentBalance = await this.commonService.findOneBalanceAPI({
        date: {
          $lte: new Date(transaction.date).toISOString().split('T')[0]
        },
        cardId: transaction.cardId
      }, true);
      if(currentBalance) {
        await this.balanceService.updateOne(currentBalance._id, {balance: currentBalance.balance - transaction.amount});
      }
      const currentNextBalances = await this.balanceService.findMany({
        date: {
          $gt: new Date(transaction.date).toISOString().split('T')[0]
        },
        cards: [new Types.ObjectId(transaction.cardId)]
      });
      if(currentNextBalances.length > 0) {
        await this.balanceService.updateMany(currentNextBalances.map((el: IBalance) => el._id.toString()), ((-1) * transaction.amount));
      }
      const newBalance = await this.commonService.findOneBalanceAPI({
        date: {
          $lte: new Date(transaction.date).toISOString().split('T')[0]
        },
        cardId: updateTransactionDto.cardId
      }, true);
      if(newBalance) {
        if(newBalance.date === new Date(transaction.date).toISOString().split('T')[0]) {
          await this.balanceService.updateOne(newBalance._id, {balance: newBalance.balance + transaction.amount});
        } else {
          await this.balanceService.createOne({
            cardId: updateTransactionDto.cardId,
            balance: newBalance.balance + transaction.amount,
            date: new Date(transaction.date).toISOString().split('T')[0]
          });
        }
      } else {
        const card = await this.commonService.findOneCardAPI('_id', updateTransactionDto.cardId);
        await this.balanceService.createOne({
          cardId: updateTransactionDto.cardId,
          balance: card.startBalance + transaction.amount,
          date: new Date(transaction.date).toISOString().split('T')[0]
        });
      }
      const newNextBalances = await this.balanceService.findMany({
        date: {
          $gt: new Date(transaction.date).toISOString().split('T')[0]
        },
        cards: [new Types.ObjectId(updateTransactionDto.cardId)]
      });
      if(newNextBalances.length > 0) {
        await this.balanceService.updateMany(newNextBalances.map((el: IBalance) => el._id.toString()), transaction.amount);
      }
      const prevCard = await this.commonService.findOneCardAPI('_id', transaction.cardId);
      await this.commonService.updateCardBalance(prevCard._id.toString(), this.commonService.calculateBalance(transaction.amount, true, prevCard.balance, transaction.amount));
      const newCard = await this.commonService.findOneCardAPI('_id', updateTransactionDto.cardId);
      await this.commonService.updateCardBalance(newCard._id.toString(), this.commonService.calculateBalance(transaction.amount, false, newCard.balance, transaction.amount));
      await this.transactionService.updateOne(id, {cardId: updateTransactionDto.cardId});
    }
    if(updateTransactionDto.amount) {
      if(updateTransactionDto.amount === 0) throw new HttpException('Amount must not be equal 0', HttpStatus.NOT_FOUND);
      const transaction = await this.commonService.findOneTransactionAPI('_id', id);
      const balance = await this.commonService.findOneBalanceAPI({
        date: {
          $lte: new Date(transaction.date).toISOString().split('T')[0]
        },
        cardId: transaction.cardId
      }, true);
      if(balance) {
        await this.balanceService.updateOne(balance._id, {balance: balance.balance + (updateTransactionDto.amount - transaction.amount)});
      }
      const nextBalances = await this.balanceService.findMany({
        date: {
          $gt: new Date(transaction.date).toISOString().split('T')[0]
        },
        cards: [new Types.ObjectId(transaction.cardId)]
      });
      if(nextBalances.length > 0) {
        await this.balanceService.updateMany(nextBalances.map((el: IBalance) => el._id.toString()), (updateTransactionDto.amount - transaction.amount));
      }
      const card = await this.commonService.findOneCardAPI('_id', transaction.cardId);
      const prevCardAmount = this.commonService.calculateBalance(transaction.amount, true, card.balance, transaction.amount);
      await this.commonService.updateCardBalance(card._id.toString(), prevCardAmount);
      await this.commonService.updateCardBalance(card._id.toString(), this.commonService.calculateBalance(updateTransactionDto.amount, false, prevCardAmount, updateTransactionDto.amount));
      await this.transactionService.updateOne(id, {amount: updateTransactionDto.amount});
    }
    const updateTransaction: IUpdateTransaction = {};
    if(updateTransactionDto.date) {
      const transaction = await this.commonService.findOneTransactionAPI('_id', id);
      const currentBalance = await this.commonService.findOneBalanceAPI({
        date: {
          $lte: new Date(transaction.date).toISOString().split('T')[0]
        },
        cardId: transaction.cardId
      }, true);
      if(currentBalance) {
        await this.balanceService.updateOne(currentBalance._id, {balance: currentBalance.balance - transaction.amount});
      }
      const futureBalance = await this.commonService.findOneBalanceAPI({
        date: {
          $lte: new Date(updateTransactionDto.date).toISOString().split('T')[0]
        },
        cardId: transaction.cardId
      }, true);
      if(futureBalance) {
        if(futureBalance.date === new Date(updateTransactionDto.date).toISOString().split('T')[0]) {
          await this.balanceService.updateOne(futureBalance._id, {balance: futureBalance.balance + transaction.amount});
        } else {
          await this.balanceService.createOne({
            cardId: transaction.cardId,
            balance: futureBalance.balance + transaction.amount,
            date: new Date(updateTransactionDto.date).toISOString().split('T')[0]
          });
        }
      } else {
        const card = await this.commonService.findOneCardAPI('_id', transaction.cardId);
        await this.balanceService.createOne({
          cardId: transaction.cardId,
          balance: card.startBalance + transaction.amount,
          date: new Date(updateTransactionDto.date).toISOString().split('T')[0]
        });
      }
      const curentFutureBalances = await this.balanceService.findMany({
        date: {
          $gt: new Date(transaction.date).toISOString().split('T')[0]
        },
        cards: [new Types.ObjectId(transaction.cardId)]
      });
      if(curentFutureBalances.length > 0) {
        await this.balanceService.updateMany(curentFutureBalances.map((el: IBalance) => el._id.toString()), ((-1) * transaction.amount));
      }
      const nextFutureBalances = await this.balanceService.findMany({
        date: {
          $gt: new Date(updateTransactionDto.date).toISOString().split('T')[0]
        },
        cards: [new Types.ObjectId(transaction.cardId)]
      });
      if(nextFutureBalances.length > 0) {
        await this.balanceService.updateMany(nextFutureBalances.map((el: IBalance) => el._id.toString()), transaction.amount);
      }
      updateTransaction.date = updateTransactionDto.date;
    }
    if(updateTransactionDto.categoryId) updateTransaction.categoryId = updateTransactionDto.categoryId;
    if(updateTransactionDto.description) updateTransaction.description = updateTransactionDto.description;
    const response = await this.transactionService.updateOne(id, updateTransaction);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
