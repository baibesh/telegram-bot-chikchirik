import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const getJWTConfig = (): JwtModuleAsyncOptions => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): JwtModuleOptions => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: { expiresIn: configService.get('JWT_EXPIRATION') },
  }),
  global: true,
});
