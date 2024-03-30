import {JwtService} from '@nestjs/jwt';
import {CommonService} from '../../../modules/common/common.service';
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
      if(tokenData._id === process.env.ADMIN_ID && tokenData.role === 'Admin') {
        req['_id'] = tokenData._id;
        req['role'] = tokenData.role;
        return true;
      }
      const user = await this.commonService.findOneUserAPI('_id', tokenData._id);
      if(user.version === tokenData.version) {
        req['_id'] = tokenData._id;
        req['role'] = tokenData.role;
        return true;
      } else {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    } catch (e) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}