import { ConfigModule, ConfigService } from '@nestjs/config';
import { SharedBullAsyncConfiguration } from '@nestjs/bull';

export const getBullAsyncConfig = (): SharedBullAsyncConfiguration => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    redis: {
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
    },
  }),
});
