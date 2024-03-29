import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {UserService} from './user.service';
import {AuthSuccessMessages} from '@messages/auth';
import {UserSuccessMessages} from '@messages/user';
import {CardService} from '@cardModule/card.service';
import {MailerService} from '@nestjs-modules/mailer';
import {ImageService} from '@imageModule/image.service';
import {AuthGuard} from '@authModule/guards/auth.guard';
import {FileInterceptor} from '@nestjs/platform-express';
import {ICardResponse} from '@cardModule/types/card.types';
import {CommonService} from '@commonModule/common.service';
import {ICustomRequest, IResponse} from '@/types/app.types';
import {UpdateUserProfileDto} from './dto/update-user-profile.dto';
import {IUpdateUserProfile, IUserResponse} from './types/user.types';
import {UpdateUserSecurityDto} from './dto/update-user-security.dto';
import {TransactionService} from '@transactionModule/transaction.service';
import {Controller, Get, Body, Put, Param, Delete, UseInterceptors, UploadedFile, HttpStatus, HttpException, UseGuards, Request} from '@nestjs/common';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly cardService: CardService,
    private readonly imageService: ImageService,
    private readonly commonService: CommonService,
    private readonly mailerService: MailerService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get(':id')
  async findOne(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<IUserResponse>> {
    const response = await this.userService.findOne(id, req.role);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: UserSuccessMessages.findOne,
    });
  }

  @Delete(':id')
  async removeOne(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<undefined>> {
    if(req.role === 'Admin' || (req._id === id && req.role !== 'Test')) {
      const user = await this.commonService.findOneUserAPI('_id', id);
      const cards = await this.cardService.findMany({ownerId: new mongoose.Types.ObjectId(id)});
      cards.cards.map(async (el: ICardResponse) => { // delete all cards transactions
        await this.transactionService.removeMany(el._id.toString());
      });
      await this.cardService.removeMany(id); // delete all users cards
      await this.imageService.removeOne(user.imageId); // delete image(avatar)
      const response = await this.userService.removeOne(id);
      return ({
        message: response,
        statusCode: HttpStatus.OK,
      });
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Delete('avatar/:id')
  async removeAvatar(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<undefined>> {
    if(req._id !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const user = await this.commonService.findOneUserAPI('_id', id);
    if(user.imageId) {
      await this.imageService.removeOne(user.imageId);
      await this.userService.updateProfile(id, {imageId: null});
    }
    return ({
      statusCode: HttpStatus.OK,
      message: UserSuccessMessages.updateOne,
    });
  }

  @Put('security/:id')
  async updateSecurity(@Request() req: ICustomRequest, @Param('id') id: string, @Body() updateUserSecurityDto: UpdateUserSecurityDto): Promise<IResponse<undefined>> {
    if(req._id !== id || req.role === 'Test') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const user = await this.commonService.findOneUserAPI('_id', id, true);
    const isPassValid = bcrypt.compareSync(updateUserSecurityDto.oldPassword, user.password);
    if(!isPassValid) throw new HttpException('Wrong old password', HttpStatus.BAD_REQUEST);
    const password = await bcrypt.hash(updateUserSecurityDto.password, 5);
    const response = await this.userService.updateSecurity(id, {password});
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put('profile/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfile(@Request() req: ICustomRequest, @Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() updateUserProfileDto: UpdateUserProfileDto): Promise<IResponse<undefined>> {
    if(req._id !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const updateUserProfile: IUpdateUserProfile = {};
    const user = await this.commonService.findOneUserAPI('_id', id);
    if(file) {
      if(user.imageId) {
        await this.imageService.updateOne(user.imageId, file.buffer, {
          folder: 'FinTrack/avatars',
          fetch_format: 'png',
          gravity: 'face', 
          crop: 'fill',
          height: 250, 
          width: 250, 
        });
      } else {
        updateUserProfile.imageId = await this.imageService.createOne(file.buffer, {
          folder: 'FinTrack/avatars',
          fetch_format: 'png',
          gravity: 'face', 
          crop: 'fill',
          height: 250, 
          width: 250, 
        });
      }
    }
    if(updateUserProfileDto.currency) {
      await this.commonService.findOneCurrency(updateUserProfileDto.currency);
      updateUserProfile.currency = updateUserProfileDto.currency;
    }
    if(updateUserProfileDto.lastName) updateUserProfile.lastName = updateUserProfileDto.lastName;
    if(updateUserProfileDto.firstName) updateUserProfile.firstName = updateUserProfileDto.firstName;
    if(updateUserProfileDto.email && req.role !== 'Test') updateUserProfile.email = updateUserProfileDto.email;
    await this.userService.updateProfile(id, updateUserProfile);
    if(updateUserProfile.email) {
      const code = this.jwtService.sign({email: updateUserProfile.email, id, password: user.password}, {expiresIn: process.env.EMAIL_CODE_EXPIRES_IN});
      await this.mailerService.sendMail({
        html: `
          <div>
            <h3>Please, do not reply to this letter</h3>
            <a href="${process.env.ORIGIN_API_URL}/confirm-email?code=${code}">Confirm your new email</a>
          </div>
        `,
        to: updateUserProfile.email,
        from: process.env.ADMIN_EMAIL,
        sender: process.env.ADMIN_EMAIL,
        replyTo: process.env.ADMIN_EMAIL,
        subject: 'Confirm your new email',
      });
      return ({
        statusCode: HttpStatus.OK,
        message: AuthSuccessMessages.sentEmail,
      });
    }
    return ({
      statusCode: HttpStatus.OK,
      message: UserSuccessMessages.updateOne,
    });
  }
}
