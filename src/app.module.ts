import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Collections} from '@/configs/collections';
import {UserModule} from '@userModule/user.module';
import {AuthModule} from '@authModule/auth.module';
import {CardModule} from '@cardModule/card.module';
import {MailerModule} from '@nestjs-modules/mailer';
import {CommonModule} from '@commonModule/common.module';
import {UserSchema} from '@userModule/schemas/user.schema';
import {BalanceModule} from './modules/balance/balance.module';
import {CategoryModule} from './modules/category/category.module';
import {TransactionModule} from './modules/transaction/transaction.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CardModule,
    CommonModule,
    BalanceModule,
    CategoryModule,
    TransactionModule,
    MailerModule.forRoot({
      transport: {
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS,
        },
        port: 465, 
        secure: true,
        ignoreTLS: true,
        host: 'smtp.gmail.com',
      },
      defaults: {
        from: `"No Reply" ${process.env.EMAIL}`,
      },
    }),
    ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
    MongooseModule.forRoot(process.env.DB_URL, {dbName: 'FinTrack'}),
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
    JwtModule.register({signOptions: {expiresIn: process.env.JWT_TOKEN_EXPIRES_IN}, secret: process.env.SECRET_KEY}),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
