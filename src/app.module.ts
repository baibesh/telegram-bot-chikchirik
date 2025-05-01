import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { getJWTConfig } from './config/jwt.config';
import { getTelegrafAsyncConfig } from './config/telegraf-async.config';
import { getBullAsyncConfig } from './config/bull-async.config';
import { BotModule } from './modules/bot/bot.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requests } from './modules/requests/requests.entity';
import { RequestsModule } from './modules/requests/requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'fastfast',
      password: 'fastfast2025',
      database: 'fastfast',
      entities: [Requests],
      synchronize: true
    }),
    JwtModule.registerAsync(getJWTConfig()),
    TelegrafModule.forRootAsync(getTelegrafAsyncConfig()),
    BullModule.forRootAsync(getBullAsyncConfig()),
    ScheduleModule.forRoot(),
    RequestsModule,
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
