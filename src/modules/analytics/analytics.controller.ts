import {Types} from 'mongoose';
import {IResponse} from '../../types/app.types';
import {IAccountResponse} from './types/account';
import {AuthGuard} from '../auth/guards/auth.guard';
import {CommonService} from '../common/common.service';
import {CardService} from '../finance/card/card.service';
import {ICurrencyRate} from '../../types/currency.types';
import {ICardsExpensesResponse} from './types/cardsExpenses';
import {ICardResponse} from '../finance/card/types/card.types';
import {IMonthlyExpensesResponse} from './types/monthlyExpenses';
import {ITransactionsStatistics} from './types/transactionsStatistics';
import {ICategoriesExpensesResponse} from './types/categoriesExpenses';
import {TransactionService} from '../finance/transaction/transaction.service';
import {Controller, Get, HttpException, HttpStatus, Query, UseGuards} from '@nestjs/common';
import {IFilters, ITransactionResponse} from '../finance/transaction/types/transaction.types';
import {AnalyticsErrorMessages, AnalyticsSuccessMessages} from '../../configs/messages/analytics';

@UseGuards(AuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly cardService: CardService,
    private readonly commonService: CommonService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get('account')
  async findAaccount(
    @Query('date') date?: string,
    @Query('cards') cards?: string,
    @Query('currency') currency?: string,
  ): Promise<IResponse<IAccountResponse>> {
    if(date && cards && currency) {
      await this.commonService.findOneCurrency(currency);
      const [start, end] = JSON.parse(date);
      const transactionsFilters: Pick<IFilters, 'date'|'cards'> = {
        date: {
          $gte: new Date(start).toISOString(),
          $lte: new Date(end).toISOString(),
        },
        cards: JSON.parse(cards).map((el: string) => new Types.ObjectId(el)),
      };
      const transactionsResponse = await this.transactionService.findMany(transactionsFilters);
      const cardsResponse = await this.cardService.findMany({_id: {$in: transactionsFilters.cards}});
      let cardsCurrenciesRates: {[key: string]: number} = {};
      const cardsCurrencies = new Set(cardsResponse.currencies);
      cardsCurrencies.delete(currency);
      const transactionsCurrenciesRates = await this.getCurrencies(start, end, currency, new Set(transactionsResponse.data.currencies));
      if(cardsCurrencies.size > 0) {
        const url = `https://api.fxratesapi.com/latest?base=${currency}&currencies=${Array.from(cardsCurrencies).join(',')}&resolution=1m&amount=1&places=6&format=json`;
        const response = await fetch(url);
        const result = await response.json();
        cardsCurrenciesRates = result.rates;
      }
      const totalExpensesIncomes: Pick<IAccountResponse, 'incomes'|'expenses'> = (transactionsResponse.data.data || []).reduce((res: Pick<IAccountResponse, 'incomes'|'expenses'>, el: ITransactionResponse): Pick<IAccountResponse, 'incomes'|'expenses'> => {
        const currencyRate = transactionsCurrenciesRates?.[`${el.date.split('T')[0]}T23:59:00.000Z`]?.[el.card.currency];
        if(el.amount > 0) {
          if((currency !== el.card.currency) && currencyRate) {
            res.incomes = +((res.incomes + (el.amount / currencyRate)).toFixed(2));
          } else {
            res.incomes = +((res.incomes + el.amount).toFixed(2));
          }
        } else if(el.amount < 0) {
          if((currency !== el.card.currency) && currencyRate) {
            res.expenses = +((res.expenses + (el.amount / currencyRate)).toFixed(2));
          } else {
            res.expenses = +((res.expenses + el.amount).toFixed(2));
          }
        }
        return res;
      }, {incomes: 0, expenses: 0});
      const totalBalance: number = (cardsResponse.cards || []).reduce((res: number, el: ICardResponse): number => {
        const currencyRate = cardsCurrenciesRates?.[el.currency];
        if((currency !== el.currency) && currencyRate) {
          res = +((res + (el.balance / currencyRate)).toFixed(2));
        } else {
          res = +((res + el.balance).toFixed(2));
        }
        return res;
      }, 0);
      return ({
        statusCode: HttpStatus.OK,
        message: AnalyticsSuccessMessages.calculate,
        data: {...totalExpensesIncomes, balance: totalBalance},
      });
    }
    throw new HttpException(AnalyticsErrorMessages.calculate, HttpStatus.BAD_REQUEST);
  }

  @Get('expenses/cards')
  async findCardsExpenses(
    @Query('date') date?: string,
    @Query('cards') cards?: string,
    @Query('currency') currency?: string,
  ): Promise<IResponse<{[key: string]: ICardsExpensesResponse}>> {
    if(date && cards && currency) {
      await this.commonService.findOneCurrency(currency);
      const [start, end] = JSON.parse(date);
      const transactionsFilters: Pick<IFilters, 'date'|'amount'|'cards'> = {
        date: {
          $gte: new Date(start).toISOString(),
          $lte: new Date(end).toISOString(),
        },
        amount: {$lt: 0},
        cards: JSON.parse(cards).map((el: string) => new Types.ObjectId(el)),
      };
      const transactionsResponse = await this.transactionService.findMany(transactionsFilters);
      const currenciesRates = await this.getCurrencies(start, end, currency, new Set(transactionsResponse.data.currencies));
      const cardsExpenses = (transactionsResponse.data.data || []).reduce((res: {[key: string]: ICardsExpensesResponse}, el: ITransactionResponse): {[key: string]: ICardsExpensesResponse} => {
        if(el.amount < 0) {
          const currencyRate = currenciesRates?.[`${el.date.split('T')[0]}T23:59:00.000Z`]?.[el.card.currency];
          if(currencyRate) {
            if(res[el.card._id.toString()]) {
              res[el.card._id.toString()].amount = +((res[el.card._id.toString()].amount + (el.amount / currencyRate)).toFixed(2));
            } else {
              res[el.card._id.toString()] = {
                color: el.card.color,
                label: el.card.title,
                amount: +((el.amount / currencyRate).toFixed(2)),
              };
            }
          } else {
            if(res[el.card._id.toString()]) {
              res[el.card._id.toString()].amount = +((res[el.card._id.toString()].amount + el.amount).toFixed(2));
            } else {
              res[el.card._id.toString()] = {
                color: el.card.color,
                label: el.card.title,
                amount: +((el.amount).toFixed(2)),
              };
            }
          }
        }
        return res;
      }, {});
      if(Object.keys(cardsExpenses).length <= 0) throw new HttpException(AnalyticsErrorMessages.NotFound, HttpStatus.NOT_FOUND);
      return ({
        data: cardsExpenses,
        statusCode: HttpStatus.OK,
        message: AnalyticsSuccessMessages.calculate,
      });
    }
    throw new HttpException(AnalyticsErrorMessages.calculate, HttpStatus.BAD_REQUEST);
  }

  @Get('expenses/monthly')
  async findMonthlyExpenses(
    @Query('date') date?: string,
    @Query('cards') cards?: string,
    @Query('currency') currency?: string,
  ): Promise<IResponse<IMonthlyExpensesResponse>> {
    if(date && cards && currency) {
      await this.commonService.findOneCurrency(currency);
      const [start, end] = JSON.parse(date);
      const transactionsFilters: Pick<IFilters, 'date'|'amount'|'cards'> = {
        date: {
          $gte: new Date(start).toISOString(),
          $lte: new Date(end).toISOString(),
        },
        amount: {$lt: 0},
        cards: JSON.parse(cards).map((el: string) => new Types.ObjectId(el)),
      };
      const transactionsResponse = await this.transactionService.findMany(transactionsFilters);
      const currenciesRates = await this.getCurrencies(start, end, currency, new Set(transactionsResponse.data.currencies));
      const responseObj = this.getDateRangeObject<number>(start, end, 'm', 0);
      (transactionsResponse.data.data || []).map((el: ITransactionResponse) => {
        const date = new Date(el.date);
        date.setDate(1);
        const dateString = date.toISOString().split('T')[0];
        if(responseObj[dateString] !== undefined) {
          const currencyRate = currenciesRates?.[`${date.toISOString().split('T')[0]}T23:59:00.000Z`]?.[el.card.currency];
          if(currencyRate) {
            responseObj[dateString] = +((responseObj[dateString] + (Math.abs(el.amount)/currencyRate)).toFixed(2));
          } else {
            responseObj[dateString] = +((responseObj[dateString] + Math.abs(el.amount)).toFixed(2));
          }
        }
      });
      if(Object.keys(responseObj).length <= 0) throw new HttpException(AnalyticsErrorMessages.NotFound, HttpStatus.NOT_FOUND);
      return ({
        data: responseObj,
        statusCode: HttpStatus.OK,
        message: AnalyticsSuccessMessages.calculate,
      });
    }
    throw new HttpException(AnalyticsErrorMessages.calculate, HttpStatus.BAD_REQUEST);
  }

  @Get('expenses/categories')
  async findCategoriesExpenses(
    @Query('date') date?: string,
    @Query('cards') cards?: string,
    @Query('currency') currency?: string,
  ): Promise<IResponse<{[key: string]: ICategoriesExpensesResponse}>> {
    if(date && cards && currency) {
      await this.commonService.findOneCurrency(currency);
      const [start, end] = JSON.parse(date);
      const transactionsFilters: Pick<IFilters, 'date'|'amount'|'cards'> = {
        date: {
          $gte: new Date(start).toISOString(),
          $lte: new Date(end).toISOString(),
        },
        amount: {$lt: 0},
        cards: JSON.parse(cards).map((el: string) => new Types.ObjectId(el)),
      };
      const transactionsResponse = await this.transactionService.findMany(transactionsFilters);
      const currenciesRates = await this.getCurrencies(start, end, currency, new Set(transactionsResponse.data.currencies));
      const categoriesExpenses = (transactionsResponse.data.data || []).reduce((res: {[key: string]: ICategoriesExpensesResponse}, el: ITransactionResponse) => {
        if(el.amount < 0) {
          const currencyRate = currenciesRates?.[`${el.date.split('T')[0]}T23:59:00.000Z`]?.[el.card.currency];
          if(currencyRate) {
            if(res[el.category._id]) {
              res[el.category._id].amount = +((res[el.category._id].amount + (el.amount / currencyRate)).toFixed(2));
            } else {
              res[el.category._id] = {
                color: el.category.color,
                label: el.category.title,
                amount: +((el.amount / currencyRate).toFixed(2)),
              };
            }
          } else {
            if(res[el.category._id]) {
              res[el.category._id].amount = +((res[el.category._id].amount + el.amount).toFixed(2));
            } else {
              res[el.category._id] = {
                color: el.category.color,
                label: el.category.title,
                amount: +((el.amount).toFixed(2)),
              };
            }
          }
        }
        return res;
      }, {});
      if(Object.keys(categoriesExpenses).length <= 0) throw new HttpException(AnalyticsErrorMessages.NotFound, HttpStatus.NOT_FOUND);
      return ({
        data: categoriesExpenses,
        statusCode: HttpStatus.OK,
        message: AnalyticsSuccessMessages.calculate,
      });
    }
    throw new HttpException(AnalyticsErrorMessages.calculate, HttpStatus.BAD_REQUEST);
  }

  @Get('transactions')
  async findTransactionsStatistics(
    @Query('date') date?: string,
    @Query('cards') cards?: string,
    @Query('currency') currency?: string,
    @Query('frequency') frequency?: 'd' | 'm',
  ): Promise<IResponse<{[key: string]: ITransactionsStatistics}>> {
    if(date && cards && currency && frequency) {
      await this.commonService.findOneCurrency(currency);
      const [start, end] = JSON.parse(date);
      const transactionsFilters: Pick<IFilters, 'date'|'cards'> = {
        date: {
          $gte: new Date(start).toISOString(),
          $lte: new Date(end).toISOString(),
        },
        cards: JSON.parse(cards).map((el: string) => new Types.ObjectId(el)),
      };
      const transactionsResponse = await this.transactionService.findMany(transactionsFilters);
      const currenciesRates = await this.getCurrencies(start, end, currency, new Set(transactionsResponse.data.currencies));
      const responseObj = this.getDateRangeObject<ITransactionsStatistics>(start, end, frequency, {incomes: 0, expenses: 0});
      (transactionsResponse.data.data || []).map((el: ITransactionResponse) => {
        let dateString = '';
        if(frequency === 'd') {
          dateString = new Date(el.date).toISOString().split('T')[0];
        } else if(frequency === 'm') {
          const date = new Date(el.date);
          date.setDate(1);
          dateString = date.toISOString().split('T')[0];
        }
        if(responseObj[dateString]) {
          const currencyRate = currenciesRates[`${dateString}T23:59:00.000Z`]?.[el.card.currency];
          if(currencyRate) {
            if(el.amount < 0) {
              (responseObj[dateString] as ITransactionsStatistics).expenses = +(((responseObj[dateString] as ITransactionsStatistics).expenses + (Math.abs(el.amount) / currencyRate)).toFixed(2));
            } else if(el.amount > 0) {
              (responseObj[dateString] as ITransactionsStatistics).incomes = +(((responseObj[dateString] as ITransactionsStatistics).incomes + (Math.abs(el.amount) / currencyRate)).toFixed(2));
            }
          } else {
            if(el.amount < 0) {
              (responseObj[dateString] as ITransactionsStatistics).expenses = +(((responseObj[dateString] as ITransactionsStatistics).expenses + Math.abs(el.amount)).toFixed(2));
            } else if(el.amount > 0) {
              (responseObj[dateString] as ITransactionsStatistics).incomes = +(((responseObj[dateString] as ITransactionsStatistics).incomes + Math.abs(el.amount)).toFixed(2));
            }
          }
        }
      });
      return ({
        data: responseObj,
        statusCode: HttpStatus.OK,
        message: AnalyticsSuccessMessages.calculate,
      });
    }
    throw new HttpException(AnalyticsErrorMessages.calculateTransactions, HttpStatus.BAD_REQUEST);
  }



  protected formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
  };

  protected getDateRangeObject<T>(startDate: string, endDate: string, frequency: 'd' | 'm', value: unknown): {[key: string]: T} {
    const endDateObj = new Date(endDate);
    const startDateObj = new Date(startDate);
    const dateObj: {[key: string]: T} = {};
    const currentDate = new Date(startDateObj);
    if(frequency === 'm') currentDate.setDate(1);
    while (currentDate <= endDateObj) {
      dateObj[this.formatDate(new Date(currentDate))] = JSON.parse(JSON.stringify(value));
      if(frequency === 'm') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if(frequency === 'd') {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    return dateObj;
  }  

  protected async getCurrencies(start: string, end: string, currency: string, currencies: Set<string>): Promise<{[key: string]: ICurrencyRate}> {
    currencies.delete(currency);
    if(currencies.size > 0) {
      const url = `https://api.fxratesapi.com/timeseries?start_date=${new Date(start).toISOString()}&end_date=${(new Date(end) < new Date()) ? new Date(end).toISOString() : new Date().toISOString()}&api_key=${process.env.ACCESS_TOKEN_CURRENCY}&base=${currency}&currencies=${Array.from(currencies).join(',')}&format=json`;
      const response = await fetch(url);
      const result = await response.json();
      return result.rates;
    }
    return {};
  }
}
