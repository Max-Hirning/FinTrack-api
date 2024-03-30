import {Module} from '@nestjs/common';
import {ImageService} from './image.service';
import {MongooseModule} from '@nestjs/mongoose';
import {ImageSchema} from './schemas/image.schema';
import {Collections} from '../../configs/collections';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Collections.images, schema: ImageSchema}]),
  ],
  exports: [ImageService],
  providers: [ImageService],
})
export class ImageModule {}
