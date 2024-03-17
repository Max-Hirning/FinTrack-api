import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema} from './schemas/user.schema';
import {UserController} from './user.controller';
import {Collections} from '@/configs/collections';
import {CardModule} from '@cardModule/card.module';
import {ImageModule} from '@imageModule/image.module';
import {CommonModule} from '@commonModule/common.module';
import {TransactionModule} from '@transactionModule/transaction.module';

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
