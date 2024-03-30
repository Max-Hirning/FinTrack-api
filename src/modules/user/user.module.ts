import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {CardModule} from '../card/card.module';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema} from './schemas/user.schema';
import {UserController} from './user.controller';
import {ImageModule} from '../image/image.module';
import {Collections} from 'src/configs/collections';
import {CommonModule} from '../common/common.module';
import {TransactionModule} from '../transaction/transaction.module';

@Module({
  imports: [
    JwtModule,
    CardModule,
    ImageModule,
    CommonModule,
    TransactionModule,
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
