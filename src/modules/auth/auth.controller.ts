import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {AuthService} from './auth.service';
import {SignInDto} from './dto/sign-in.dto';
import {SignUpDto} from './dto/sign-up.dto';
import {AuthGuard} from './guards/auth.guard';
import {MailerService} from '@nestjs-modules/mailer';
import {ISignInResponse} from './types/sign-in.types';
import {CommonService} from '../common/common.service';
import {EmailRequestDto} from './dto/email-request.dto';
import {ResetPasswordDto} from './dto/reset-password.dto';
import {ICustomRequest, IResponse} from '../../types/app.types';
import {AuthErrorMessages, AuthSuccessMessages} from '../../configs/messages/auth';
import {Controller, Post, Body, HttpStatus, HttpException, UseGuards, Request} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
    private readonly commonService: CommonService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<IResponse<undefined>> {
    throw new HttpException('Sorry, there is no free space', HttpStatus.FORBIDDEN);
    if(signUpDto.email === process.env.ADMIN_EMAIL) throw new HttpException(AuthErrorMessages.existedUser, HttpStatus.BAD_REQUEST);
    const user = await this.commonService.findOneUserAPI('email', signUpDto.email, true);
    if(user) throw new HttpException(AuthErrorMessages.existedUser, HttpStatus.BAD_REQUEST);
    const password = await bcrypt.hash(signUpDto.password, 5);
    const createdUser = await this.authService.signUp({...signUpDto, password});
    const code = this.jwtService.sign({version: createdUser.version, _id: createdUser._id}, {expiresIn: process.env.EMAIL_CODE_EXPIRES_IN});
    await this.mailerService.sendMail({
      html: `
        <div>
          <h3>Please, do not reply to this letter</h3>
          <a href="${process.env.ORIGIN_API_URL}/confirm-email?code=${code}">Confirm your email to proceed using our service</a>
        </div>
      `,
      to: signUpDto.email,
      subject: 'Confirm your email',
      from: process.env.ADMIN_EMAIL,
      sender: process.env.ADMIN_EMAIL,
      replyTo: process.env.ADMIN_EMAIL,
    });
    return ({
      statusCode: HttpStatus.CREATED,
      message: AuthSuccessMessages.sentEmail,
    });
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<IResponse<ISignInResponse>> {
    if(this.authService.isAdmin(signInDto)) {
      return ({
        data: {
          userId: process.env.ADMIN_ID,
          token: this.jwtService.sign({_id: process.env.ADMIN_ID, version: 0, role: 'Admin'}),
        },
        statusCode: HttpStatus.OK,
        message: AuthSuccessMessages.signIn,
      });
    }
    const user = await this.commonService.findOneUserAPI('email', signInDto.email);
    const isPassValid = bcrypt.compareSync(signInDto.password, user.password);
    if(!isPassValid) throw new HttpException(AuthErrorMessages.wrongPassword, HttpStatus.BAD_REQUEST);
    if(user.__v === 0) throw new HttpException(AuthErrorMessages.confirmEmail, HttpStatus.BAD_REQUEST);
    if(signInDto.email === 'test@gmail.com') {
      return ({
        data: {
          userId: user._id.toString(),
          token: this.jwtService.sign({_id: user._id, version: user.version, role: 'Test'}),
        },
        statusCode: HttpStatus.OK,
        message: AuthSuccessMessages.signIn,
      });
    }
    return ({
      data: {
        userId: user._id.toString(),
        token: this.jwtService.sign({_id: user._id, version: user.version, role: 'User'}),
      },
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.signIn,
    });
  }

  @Post('email-request')
  async emailRequest(@Body() emailRequestDto: EmailRequestDto): Promise<IResponse<undefined>> {
    if(emailRequestDto.email === 'test@gmail.com' || emailRequestDto.email === process.env.ADMIN_EMAI) throw new HttpException('No such email', HttpStatus.NOT_FOUND);
    const user = await this.commonService.findOneUserAPI('email', emailRequestDto.email);
    const code = this.jwtService.sign({_id: user._id, version: user.version, role: 'User'}, {expiresIn: process.env.EMAIL_CODE_EXPIRES_IN});
    await this.mailerService.sendMail({
      html: `
        <div>
          <h3>Please, do not reply to this letter</h3>
          <a href="${emailRequestDto.url}/?code=${code}">Update your security data</a>
        </div>
      `,
      to: user.email,
      from: process.env.ADMIN_EMAIL,
      sender: process.env.ADMIN_EMAIL,
      replyTo: process.env.ADMIN_EMAIL,
      subject: 'Update your security data',
    });
    return ({
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.sentEmail,
    });
  }

  @UseGuards(AuthGuard)
  @Post('reset-password')
  async resetPassword(@Request() req: ICustomRequest, @Body() resetPasswordDto: ResetPasswordDto): Promise<IResponse<undefined>> {
    const user = await this.commonService.findOneUserAPI('_id', req._id);
    if(user.email === 'test@gmail.com') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const password = await bcrypt.hash(resetPasswordDto.password, 5);
    const response = await this.authService.resetPassword(user._id.toString(), {password});
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
