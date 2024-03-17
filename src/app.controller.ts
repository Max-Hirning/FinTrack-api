import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {AppService} from './app.service';
import {IResponse} from './types/app.types';
import {ICurrency} from './types/currency.types';
import {AuthErrorMessages} from '@messages/auth';
import {CommonService} from '@commonModule/common.service';
import {CurrencySuccessMessages} from '@messages/currency';
import {Controller, Get, HttpException, HttpStatus, Query, Redirect} from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appService: AppService,
    private readonly commonService: CommonService,
  ) {}

  @Get('currencies')
  async getCurrencies(): Promise<IResponse<ICurrency[]>> {
    const response = await fetch('https://api.fxratesapi.com/currencies');
    const currencies = await response.json();
    return ({
      statusCode: HttpStatus.OK,
      data: Object.values(currencies),
      message: CurrencySuccessMessages.findMany,
    });
  }

  @Get('confirm-email')
  @Redirect(`${process.env.ORIGIN_URL}/auth/sign-in`, HttpStatus.SEE_OTHER)
  async confirmEmail(@Query('code') code: string): Promise<void> {
    const codeData = await this.jwtService.decode(code);
    const user = await this.commonService.findOneUserAPI('_id', codeData._id);
    const isPassValid = bcrypt.compare(codeData.password, user.password);
    if(user.email === codeData.email && isPassValid) {
      await this.appService.confirmEmail(user._id.toString());
      return;
    }
    throw new HttpException(AuthErrorMessages.wrongCode, HttpStatus.BAD_REQUEST);
  }
}
