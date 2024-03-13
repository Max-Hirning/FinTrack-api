import mongoose from 'mongoose';
import {CardService} from './card.service';
import {IResponse} from '@/types/app.types';
import {CardSuccessMessages} from '@messages/card';
import {CreateCardDto} from './dto/create-card.dto';
import {UpdateCardDto} from './dto/update-card.dto';
import {AuthGuard} from '@authModule/guards/auth.guard';
import {CommonService} from '@commonModule/common.service';
import {ICard, IFilters, IUpdateCard} from './types/card.types';
import {Controller, Get, Post, Body, Put, Param, Delete, HttpStatus, Query, HttpException, UseGuards} from '@nestjs/common';

@Controller('card')
@UseGuards(AuthGuard)
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly commonService: CommonService,
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
  async remove(@Param('id') id: string): Promise<IResponse<undefined>> { // delete all transactions
    const response = await this.cardService.remove(id);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Get()
  async findMany(@Query('ownerId') ownerId?: string): Promise<IResponse<ICard[]>> {
    if(!ownerId) throw new HttpException('"ownerId" is required', HttpStatus.BAD_REQUEST);
    const filters: IFilters = {
      ownerId: new mongoose.Types.ObjectId(ownerId)
    };
    const response = await this.cardService.findMany(filters);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: CardSuccessMessages.findMany,
    });
  }

  @Post()
  async create(@Body() createCardDto: CreateCardDto): Promise<IResponse<undefined>> {
    await this.commonService.findOneUserAPI('_id', createCardDto.ownerId, false);
    await this.commonService.findOneCurrency(createCardDto.currency);
    const response = await this.cardService.create(createCardDto);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto): Promise<IResponse<undefined>> {
    const updateCard: IUpdateCard = {};
    if(updateCardDto.currency) {
      await this.commonService.findOneCurrency(updateCardDto.currency);
      updateCard.currency = updateCardDto.currency;
    }
    if(updateCardDto.color) updateCard.color = updateCardDto.color;
    if(updateCardDto.title) updateCard.title = updateCardDto.title;
    const response = await this.cardService.update(id, updateCardDto);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
