import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { HttpModule } from '@nestjs/axios';
import { BaseScene } from './scenes/base.scene';
import { BullModule } from '@nestjs/bull';
import { BullTemplateProcessor } from '../../queues/bull-template.processor';

@Module({
  imports: [HttpModule, BullModule.registerQueueAsync({ name: 'template' })],
  providers: [BotUpdate, BotService, BaseScene, BullTemplateProcessor],
  controllers: [BotController],
})
export class BotModule {}
