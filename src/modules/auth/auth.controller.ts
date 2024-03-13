import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {AuthService} from './auth.service';
import {SignInDto} from './dto/sign-in.dto';
import {IResponse} from '@/types/app.types';
import {SignUpDto} from './dto/sign-up.dto';
import {MailerService} from '@nestjs-modules/mailer';
import {ISignInResponse} from './types/sign-in.types';
import {CommonService} from '../common/common.service';
import {AuthErrorMessages, AuthSuccessMessages} from '@/configs/messages/auth';
import {Controller, Post, Body, HttpStatus, HttpException} from '@nestjs/common';

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
    const user = await this.commonService.findOneUserAPI('email', signUpDto.email, true);
    if(user) throw new HttpException(AuthErrorMessages.existedUser, HttpStatus.BAD_REQUEST);
    const password = await bcrypt.hash(signUpDto.password, 5);
    const userId = await this.authService.signUp({...signUpDto, password});
    const code = this.jwtService.sign({email: signUpDto.email, id: userId, password}, {expiresIn: process.env.EMAIL_CODE_EXPIRES_IN});
    await this.mailerService.sendMail({
      html: `
        <div>
          <h3>Please, do not reply to this letter</h3>
          <a href="${process.env.ORIGIN_API_URL}/confirm-email?code=${code}">Confirm your email to proceed using our service</a>
        </div>
      `,
      to: signUpDto.email,
      subject: 'Confirm your email',
    });
    return ({
      statusCode: HttpStatus.CREATED,
      message: AuthSuccessMessages.sentEmail,
    });
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<IResponse<ISignInResponse>> {
    if(this.authService.isAdmin(signInDto)) {
      const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 5);
      return ({
        data: {
          userId: process.env.ADMIN_ID,
          token: this.jwtService.sign({id: process.env.ADMIN_ID, email: process.env.ADMIN_EMAIL, password}),
        },
        statusCode: HttpStatus.OK,
        message: AuthSuccessMessages.signIn,
      });
    }
    const user = await this.commonService.findOneUserAPI('email', signInDto.email, true);
    const isPassValid = bcrypt.compareSync(signInDto.password, user.password);
    if(!isPassValid) throw new HttpException(AuthErrorMessages.wrongPassword, HttpStatus.BAD_REQUEST);
    if(user.__v === 0) throw new HttpException(AuthErrorMessages.confirmEmail, HttpStatus.BAD_REQUEST);
    return ({
      data: {
        userId: user.id,
        token: this.jwtService.sign({id: user.id, email: user.email, password: user.password}),
      },
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.signIn,
    });
  }
}
