import {Module} from '@nestjs/common';
import {ImageService} from './image.service';
import {MongooseModule} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import {ImageSchema} from './schemas/image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Collections.images, schema: ImageSchema}]),
  ],
  exports: [ImageService],
  providers: [ImageService],
})
export class ImageModule {}
