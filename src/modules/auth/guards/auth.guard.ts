import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {CommonService} from '@commonModule/common.service';
import {CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly commonService: CommonService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if(bearer !== 'Bearer' || !token) throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      const tokenData = this.jwtService.verify(token, {secret: process.env.SECRET_KEY});
      if(tokenData._id === process.env.ADMIN_ID && tokenData.email === process.env.ADMIN_EMAIL) {
        const isPassValid = bcrypt.compareSync(process.env.ADMIN_PASSWORD, tokenData.password);
        if(isPassValid) return true;
      }
      const user = await this.commonService.findOneUserAPI('_id', tokenData._id, true);
      if(user.email === tokenData.email && tokenData.password === user.password) {
        return true;
      } else {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    } catch (e) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}