import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestBroadcastService } from './request-broadcast.service';
import { BullModule } from '@nestjs/bull';
import { RequestBroadcastProcessor } from '../../queues/request-broadcast.processor';
import { RequestBroadcastController } from './request-broadcast.controller';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'request-broadcast',
    }),
  ],
  controllers: [RequestBroadcastController],
  providers: [RequestsService, RequestBroadcastService, RequestBroadcastProcessor],
  exports: [RequestsService, RequestBroadcastService]
})
export class RequestsModule {}
