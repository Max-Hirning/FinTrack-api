import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Collections} from './configs/collections';
import {MailerModule} from '@nestjs-modules/mailer';
import {UserModule} from './modules/user/user.module';
import {AuthModule} from './modules/auth/auth.module';
import {CardModule} from './modules/card/card.module';
import {CommonModule} from './modules/common/common.module';
import {UserSchema} from './modules/user/schemas/user.schema';
import {CategoryModule} from './modules/category/category.module';
import {AnalyticsModule} from './modules/analytics/analytics.module';
import {TransactionModule} from './modules/transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
    AuthModule,
    UserModule,
    CardModule,
    CommonModule,
    CategoryModule,
    AnalyticsModule,
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
        sender: process.env.EMAIL,
        replyTo: process.env.EMAIL,
        from: `"No Reply" ${process.env.EMAIL}`,
      },
    }),
    MongooseModule.forRoot(process.env.DB_URL, {dbName: 'FinTrack'}),
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
    JwtModule.register({signOptions: {expiresIn: process.env.JWT_TOKEN_EXPIRES_IN}, secret: process.env.SECRET_KEY}),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
