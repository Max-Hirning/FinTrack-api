import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {UserService} from './user.service';
import {IResponse} from '@/types/app.types';
import {ImageService} from '../image/image.service';
import {MailerService} from '@nestjs-modules/mailer';
import {CommonService} from '../common/common.service';
import {FileInterceptor} from '@nestjs/platform-express';
import {AuthSuccessMessages} from '@/configs/messages/auth';
import {UserSuccessMessages} from '@/configs/messages/user';
import {IUpdateUserProfile, IUser} from './types/user.types';
import {UpdateUserProfileDto} from './dto/update-user-profile.dto';
import {UpdateUserSecurityDto} from './dto/update-user-security.dto';
import {Controller, Get, Body, Put, Param, Delete, UseInterceptors, UploadedFile, HttpStatus, HttpException} from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly imageService: ImageService,
    private readonly commonService: CommonService,
    private readonly mailerService: MailerService,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<IUser>> {
    const response = await this.userService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: UserSuccessMessages.findOne,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IResponse<undefined>> { // delete transactions, cards
    const user = await this.commonService.findOneUserAPI('_id', id);
    await this.imageService.remove(user.imageId); // delete image(avatar)
    const response = await this.userService.remove(id);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put('security/:id')
  async updateSecurity(@Param('id') id: string, @Body() updateUserSecurityDto: UpdateUserSecurityDto): Promise<IResponse<undefined>> {
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
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() updateUserProfileDto: UpdateUserProfileDto): Promise<IResponse<undefined>> {
    const updateUserProfile: IUpdateUserProfile = {};
    const user = await this.commonService.findOneUserAPI('_id', id, true);
    if(file) {
      if(user.imageId) {
        await this.imageService.update(user.imageId, file.buffer, {folder: 'FinTrack/avatars'});
      } else {
        updateUserProfile.imageId = await this.imageService.create(file.buffer, {folder: 'FinTrack/avatars'});
      }
    }
    if(updateUserProfileDto.currency) {
      await this.commonService.findOneCurrency(updateUserProfileDto.currency);
      updateUserProfile.currency = updateUserProfileDto.currency;
    }
    if(updateUserProfileDto.email) updateUserProfile.email = updateUserProfileDto.email;
    if(updateUserProfileDto.lastName) updateUserProfile.lastName = updateUserProfileDto.lastName;
    if(updateUserProfileDto.firstName) updateUserProfile.firstName = updateUserProfileDto.firstName;
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
