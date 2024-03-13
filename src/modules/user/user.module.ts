import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema} from './schemas/user.schema';
import {UserController} from './user.controller';
import {Collections} from '@/configs/collections';
import {CommonModule} from '../common/common.module';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
