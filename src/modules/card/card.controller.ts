import {Types} from 'mongoose';
import {CardService} from './card.service';
import {IResponse} from '@/types/app.types';
import {CardSuccessMessages} from '@messages/card';
import {CreateCardDto} from './dto/create-card.dto';
import {UpdateCardDto} from './dto/update-card.dto';
import {ICard, IUpdateCard} from './types/card.types';
import {AuthGuard} from '@authModule/guards/auth.guard';
import {CommonService} from '@commonModule/common.service';
import {BalanceService} from '@balanceModule/balance.service';
import {TransactionService} from '@transactionModule/transaction.service';
import {Controller, Get, Post, Body, Put, Param, Delete, HttpStatus, Query, UseGuards, HttpException} from '@nestjs/common';

@Controller('card')
@UseGuards(AuthGuard)
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly commonService: CommonService,
    private readonly balanceService: BalanceService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<ICard>> {
    const response = await this.cardService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: CardSuccessMessages.findOne,
    });
  }

  @Delete(':id')
  async removeOne(@Param('id') id: string): Promise<IResponse<undefined>> {
    await this.transactionService.removeMany(id); // delete all cards transactions
    await this.balanceService.removeMany(id); // delete all cards balances
    const response = await this.cardService.removeOne(id);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Get()
  async findMany(
    @Query('cards') cards?: string,
    @Query('ownerId') ownerId?: string,
  ): Promise<IResponse<ICard[]>> {
    if(cards) {
      const response = await this.cardService.findMany({_id: {$in: JSON.parse(cards).map((el: string) => new Types.ObjectId(el))}});
      return ({
        data: response,
        statusCode: HttpStatus.OK,
        message: CardSuccessMessages.findMany,
      });
    }

    if(ownerId) {
      const response = await this.cardService.findMany({ownerId: new Types.ObjectId(ownerId)});
      return ({
        data: response,
        statusCode: HttpStatus.OK,
        message: CardSuccessMessages.findMany,
      });
    }

    throw new HttpException('Either "cards" or "ownerId" is required', HttpStatus.BAD_REQUEST);
  }

  @Post()
  async createOne(@Body() createCardDto: CreateCardDto): Promise<IResponse<undefined>> {
    await this.commonService.findOneUserAPI('_id', createCardDto.ownerId);
    await this.commonService.findOneCurrency(createCardDto.currency);
    const response = await this.cardService.createOne({
      title: createCardDto.title,
      color: createCardDto.color,
      ownerId: createCardDto.ownerId,
      balance: createCardDto.balance,
      currency: createCardDto.currency,
      startBalance: createCardDto.balance,
    });
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put(':id')
  async updateOne(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto): Promise<IResponse<undefined>> {
    const updateCard: IUpdateCard = {};
    if(updateCardDto.currency) {
      await this.commonService.findOneCurrency(updateCardDto.currency);
      updateCard.currency = updateCardDto.currency;
    }
    if(updateCardDto.color) updateCard.color = updateCardDto.color;
    if(updateCardDto.title) updateCard.title = updateCardDto.title;
    const response = await this.cardService.updateOne(id, updateCardDto);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
