import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {ICurrency} from '@/types/currency.types';
import {UserErrorMessages} from '@messages/user';
import {Collections} from '@/configs/collections';
import {IUser} from '@userModule/types/user.types';
import {ICard} from '@cardModule/types/card.types';
import {User} from '@userModule/schemas/user.schema';
import {Card} from '@cardModule/schemas/card.schema';
import {BalanceErrorMessages} from '@messages/balance';
import {CurrencyErrorMessages} from '@messages/currency';
import {IBalance} from '@balanceModule/types/balance.types';
import {Balance} from '@balanceModule/schemas/balance.schema';
import {ICategory} from '@categoryModule/types/category.types';
import {TransactionErrorMessages} from '@messages/transaction';
import {Category} from '@categoryModule/schemas/category.schema';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CardErrorMessages, CardSuccessMessages} from '@messages/card';
import {ITransaction} from '@transactionModule/types/transaction.types';
import {Transaction} from '@transactionModule/schemas/transaction.schema';

@Injectable()
export class CommonService {
  constructor(
    @InjectModel(Collections.users) private readonly userModel: Model<User>,
    @InjectModel(Collections.cards) private readonly cardModel: Model<Card>,
    @InjectModel(Collections.balances) private readonly balanceModel: Model<Balance>,
    @InjectModel(Collections.categories) private readonly categoryModel: Model<Category>,
    @InjectModel(Collections.transactions) private readonly transactionModel: Model<Transaction>,
  ) {}

  async findOneCurrency(id: string): Promise<ICurrency> {
    const response = await fetch('https://api.fxratesapi.com/currencies');
    const currencies = await response.json();
    const currency = currencies[id];
    if(!currency) throw new HttpException(CurrencyErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return currency;
  }

  async updateCardBalance(id: string, balance: number): Promise<string> {
    await this.cardModel.updateOne({_id: id}, {balance});
    return CardSuccessMessages.updateOne;
  }

  async findOneCardAPI(key: '_id', value: string, noCheck?: boolean): Promise<ICard> {
    const card = await this.cardModel.findOne({[key]: value});
    if(!noCheck) {
      if(!card) throw new HttpException(CardErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return card;
  }

  async findOneUserAPI(key: '_id'|'email', value: string, noCheck?: boolean): Promise<IUser> {
    const user = await this.userModel.findOne({[key]: value});
    if(!noCheck) {
      if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findOneCategoryAPI(key: '_id', value: string, noCheck?: boolean): Promise<ICategory> {
    const category = await this.categoryModel.findOne({[key]: value});
    if(!noCheck) {
      if(!category) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return category;
  }

  async findOneTransactionAPI(key: '_id'|'categoryId', value: string, noCheck?: boolean): Promise<ITransaction> {
    const transaction = await this.transactionModel.findOne({[key]: value});
    if(!noCheck) {
      if(!transaction) throw new HttpException(TransactionErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return transaction;
  }

  async findOneBalanceAPI(value: {
    date?: {
      $gt?:string;
      $lt?: string;
      $gte?: string;
      $lte?: string;
    };
    _id?: string;
    cardId?: string;
  }, noCheck?: boolean): Promise<IBalance> {
    const [balance] = await this.balanceModel.find(value).sort({date: -1});
    if(!noCheck) {
      if(!balance) throw new HttpException(BalanceErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return balance;
  }

  calculateBalance(transactionType: number, isActionReverse: boolean, cardBalance: number, transactionAmmount: number): number {
    if(transactionType > 0) return (isActionReverse) ? cardBalance - Math.abs(transactionAmmount) : cardBalance + Math.abs(transactionAmmount);
    if(transactionType < 0) return (isActionReverse) ? cardBalance + Math.abs(transactionAmmount) : cardBalance - Math.abs(transactionAmmount);
    if(transactionType === 0) return cardBalance;
    throw new HttpException('TypeId is required', HttpStatus.BAD_REQUEST);
  }
}
