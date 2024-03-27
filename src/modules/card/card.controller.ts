import {Types} from 'mongoose';
import {CardService} from './card.service';
import {CardSuccessMessages} from '@messages/card';
import {CreateCardDto} from './dto/create-card.dto';
import {UpdateCardDto} from './dto/update-card.dto';
import {AuthGuard} from '@authModule/guards/auth.guard';
import {CommonService} from '@commonModule/common.service';
import {ICustomRequest, IResponse} from '@/types/app.types';
import {ICardResponse, ICardsList, IUpdateCard} from './types/card.types';
import {TransactionService} from '@transactionModule/transaction.service';
import {Controller, Get, Post, Body, Put, Param, Delete, HttpStatus, Query, UseGuards, HttpException, Request} from '@nestjs/common';

@Controller('card')
@UseGuards(AuthGuard)
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly commonService: CommonService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get()
  async findMany(
    @Query('cards') cards?: string,
    @Query('ownerId') ownerId?: string,
  ): Promise<IResponse<ICardsList>> {
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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<ICardResponse>> {
    const response = await this.cardService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: CardSuccessMessages.findOne,
    });
  }

  @Delete(':id')
  async removeOne(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<undefined>> {
    const card = await this.commonService.findOneCardAPI('_id', id);
    if(req._id === card.ownerId.toString() || req.role === 'Admin') {
      await this.transactionService.removeMany(id); // delete all cards transactions
      const response = await this.cardService.removeOne(id);
      return ({
        message: response,
        statusCode: HttpStatus.OK,
      });
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Post()
  async createOne(@Request() req: ICustomRequest, @Body() createCardDto: CreateCardDto): Promise<IResponse<undefined>> {
    if(req._id !== createCardDto.ownerId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
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
  async updateOne(@Request() req: ICustomRequest, @Param('id') id: string, @Body() updateCardDto: UpdateCardDto): Promise<IResponse<undefined>> {
    const card = await this.commonService.findOneCardAPI('_id', id);
    if(req._id !== card.ownerId.toString()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
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
