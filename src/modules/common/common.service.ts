import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {CardErrorMessages} from '@messages/card';
import {ICurrency} from '@/types/currency.types';
import {UserErrorMessages} from '@messages/user';
import {Collections} from '@/configs/collections';
import {IUser} from '@userModule/types/user.types';
import {ICard} from '@cardModule/types/card.types';
import {User} from '@userModule/schemas/user.schema';
import {Card} from '@cardModule/schemas/card.schema';
import {CurrencyErrorMessages} from '@messages/currency';
import {ICategory} from '@categoryModule/types/category.types';
import {Category} from '@categoryModule/schemas/category.schema';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';

@Injectable()
export class CommonService {
  constructor(
    @InjectModel(Collections.users) private readonly userModel: Model<User>,
    @InjectModel(Collections.cards) private readonly cardModel: Model<Card>,
    @InjectModel(Collections.categories) private readonly categoryModel: Model<Category>,
  ) {}

  async findOneCurrency(id: string): Promise<ICurrency> {
    const response = await fetch('https://api.fxratesapi.com/currencies');
    const currencies = await response.json();
    const currency = currencies[id];
    if(!currency) throw new HttpException(CurrencyErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return currency;
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

  async findOneCardAPI(key: '_id'|'ownerId', value: string, noCheck?: boolean): Promise<ICard> {
    const card = await this.cardModel.findOne({[key]: value});
    if(!noCheck) {
      if(!card) throw new HttpException(CardErrorMessages.findOne, HttpStatus.NOT_FOUND);
    }
    return card;
  }
}
