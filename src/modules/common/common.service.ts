import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {IUser} from '../user/types/user.types';
import {User} from '../user/schemas/user.schema';
import {ICurrency} from '../../types/currency.types';
import {Collections} from '../../configs/collections';
import {ICard} from '../finance/card/types/card.types';
import {Card} from '../finance/card/schemas/card.schema';
import {ICategory} from '../category/types/category.types';
import {Category} from '../category/schemas/category.schema';
import {UserErrorMessages} from '../../configs/messages/user';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CurrencyErrorMessages} from '../../configs/messages/currency';
import {TransactionErrorMessages} from '../../configs/messages/transaction';
import {ITransaction} from '../finance/transaction/types/transaction.types';
import {Transaction} from '../finance/transaction/schemas/transaction.schema';
import {CardSuccessMessages, CardErrorMessages} from '../../configs/messages/card';

@Injectable()
export class CommonService {
  constructor(
    @InjectModel(Collections.users) private readonly userModel: Model<User>,
    @InjectModel(Collections.cards) private readonly cardModel: Model<Card>,
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

  calculateBalance(transactionType: number, isActionReverse: boolean, cardBalance: number, transactionAmmount: number): number {
    if(transactionType > 0) return (isActionReverse) ? cardBalance - Math.abs(transactionAmmount) : cardBalance + Math.abs(transactionAmmount);
    if(transactionType < 0) return (isActionReverse) ? cardBalance + Math.abs(transactionAmmount) : cardBalance - Math.abs(transactionAmmount);
    if(transactionType === 0) return cardBalance;
    throw new HttpException('TypeId is required', HttpStatus.BAD_REQUEST);
  }
}
