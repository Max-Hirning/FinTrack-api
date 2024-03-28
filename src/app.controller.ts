import {Response} from 'express';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {AppService} from './app.service';
import {ICurrency} from './types/currency.types';
import {AuthErrorMessages} from '@messages/auth';
import {ContactUsDto} from './dto/contact-us.dto';
import {MailerService} from '@nestjs-modules/mailer';
import {AuthGuard} from './modules/auth/guards/auth.guard';
import {CommonService} from '@commonModule/common.service';
import {CurrencySuccessMessages} from '@messages/currency';
import {ICustomRequest, IResponse} from './types/app.types';
import {Body, Controller, Get, HttpException, HttpStatus, Post, Query, Request, Res, UseGuards} from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appService: AppService,
    private readonly mailerService: MailerService,
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
  async confirmEmail(@Res() res: Response, @Query('code') code: string): Promise<void> {
    res.redirect(`${process.env.ORIGIN_URL}/auth/sign-in`);
    const codeData = await this.jwtService.decode(code);
    const user = await this.commonService.findOneUserAPI('_id', codeData._id);
    const isPassValid = bcrypt.compare(codeData.password, user.password);
    if(user.email === codeData.email && isPassValid) {
      await this.appService.confirmEmail(user._id.toString());
      return;
    }
    throw new HttpException(AuthErrorMessages.wrongCode, HttpStatus.BAD_REQUEST);
  }

  @Post('contact-us')
  @UseGuards(AuthGuard)
  async contactUs(@Request() req: ICustomRequest, @Body() contactUsDto: ContactUsDto): Promise<IResponse<undefined>> {
    const user = await this.commonService.findOneUserAPI('_id', contactUsDto.userId);
    if(req._id !== user._id.toString()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const paragraphs = contactUsDto.text.split('\n');
    let letterContext = '';
    paragraphs.forEach((el: string) => {
      letterContext += `<p>${el}</p> </br>`;
    });
    await this.mailerService.sendMail({
      html: `
        <div>
          <h1>${contactUsDto.title}</h1>
          <h3>User: ${user.firstName} ${user.lastName}</h3>
          <h4>User id: ${user._id}</h4>
          <h4>User email: ${user.email}</h4>
          <hr/>
          ${letterContext}
        </div>
      `,
      from: user.email,
      sender: user.email,
      replyTo: user.email,
      subject: 'FinTrack App',
      to: process.env.ADMIN_EMAIL,
    });
    return ({
      statusCode: HttpStatus.CREATED,
      message: 'You have sent email',
    });
  }
}
