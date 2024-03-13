import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
  // eslint-disable-next-line no-console
  console.log('API is running');
}

bootstrap();
