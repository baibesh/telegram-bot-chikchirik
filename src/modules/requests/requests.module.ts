import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requests } from './requests.entity';
import { RequestsService } from './requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([Requests])],
  providers: [RequestsService],
  exports: [RequestsService]
})
export class RequestsModule {}
