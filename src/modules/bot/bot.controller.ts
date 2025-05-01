import { Body, Controller, Post } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Controller('bot')
export class BotController {
  constructor(@InjectQueue('template') private template: Queue) {}

  @Post('message')
  async message(@Body() message: MessageDto) {
    console.log('message post', message);
    await this.template.add('message', message);
  }
}
