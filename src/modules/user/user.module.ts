import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema} from './schemas/user.schema';
import {UserController} from './user.controller';
import {ImageModule} from '../image/image.module';
import {CommonModule} from '../common/common.module';
import {Collections} from '../../configs/collections';
import {CardModule} from '../finance/card/card.module';
import {TransactionModule} from '../finance/transaction/transaction.module';

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
