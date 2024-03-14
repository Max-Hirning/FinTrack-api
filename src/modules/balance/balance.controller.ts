import {Types} from 'mongoose';
import {IResponse} from '@/types/app.types';
import {BalanceService} from './balance.service';
import {IBalance, IFilters} from './types/balance.types';
import {TransactionSuccessMessages} from '@messages/transaction';
import {Controller, Get, HttpStatus, Query, HttpException} from '@nestjs/common';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  async findMany(
    @Query('date') date?: string,
    @Query('cards') cards?: string, 
  ): Promise<IResponse<IBalance[]>> {
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
    const response = await this.balanceService.findMany(filters);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: TransactionSuccessMessages.findMany,
    });
  }
}
