import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {AuthService} from './auth.service';
import {ConfigModule} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import {AuthController} from './auth.controller';
import {Collections} from 'src/configs/collections';
import {CommonModule} from '../common/common.module';
import {UserSchema} from '../user/schemas/user.schema';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
    JwtModule.register({signOptions: {expiresIn: process.env.JWT_TOKEN_EXPIRES_IN}, secret: process.env.SECRET_KEY}),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
