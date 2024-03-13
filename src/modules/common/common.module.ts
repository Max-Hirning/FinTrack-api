import {Module} from '@nestjs/common';
import {CommonService} from './common.service';
import {MongooseModule} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import {UserSchema} from '@userModule/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
  ],
  exports: [CommonService],
  providers: [CommonService],
})
export class CommonModule {}
