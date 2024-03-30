import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import {v2 as cloudinary} from 'cloudinary';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  cloudinary.config({
    api_key: process.env.CLOUDINARY_APIKEY,
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_secret: process.env.CLOUDINARY_APISECRET,
  });
  app.enableCors({
    origin: [
      process.env.ORIGIN_URL,
      'http://localhost:3000',
    ],
    methods: 'GET, PUT, POST, DELETE, OPTIONS',
  });
  await app.listen(process.env.PORT);
  // eslint-disable-next-line no-console
  console.log('API is running');
}

bootstrap();
