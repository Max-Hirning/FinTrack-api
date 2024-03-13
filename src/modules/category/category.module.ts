import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {MongooseModule} from '@nestjs/mongoose';
import {ImageModule} from '../image/image.module';
import {Collections} from '@/configs/collections';
import {CategoryService} from './category.service';
import {CommonModule} from '../common/common.module';
import {CategoryController} from './category.controller';
import {CategorySchema} from './schemas/category.schema';

@Module({
  imports: [
    JwtModule,
    ImageModule,
    CommonModule,
    MongooseModule.forFeature([{name: Collections.categories, schema: CategorySchema}]),
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
