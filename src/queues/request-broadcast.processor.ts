import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Processor('request-broadcast')
@Injectable()
export class RequestBroadcastProcessor {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @Process('send-group-message')
  async handleSendGroupMessage(job: Job<{ groupId: number; message: string; requestId: number }>) {
    const { groupId, message, requestId } = job.data;
    
    try {
      // Send message to the group with inline button
      await this.bot.telegram.sendMessage(String(groupId), message, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Откликнуться',
                callback_data: `respond:${requestId}`,
              },
            ],
          ],
        },
      });
      
      return { success: true, groupId };
    } catch (error) {
      console.error(`Failed to send message to group ${groupId}:`, error.message);
      return { success: false, groupId, error: error.message };
    }
  }

  @Process('send-personal-message')
  async handleSendPersonalMessage(job: Job<{ userId: number; message: string; requestId: number }>) {
    const { userId, message, requestId } = job.data;
    
    try {
      // Send personal message to the user
      await this.bot.telegram.sendMessage(String(userId), message, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Обновить предложение',
                callback_data: `update_response:${requestId}`,
              },
            ],
          ],
        },
      });
      
      return { success: true, userId };
    } catch (error) {
      console.error(`Failed to send message to user ${userId}:`, error.message);
      return { success: false, userId, error: error.message };
    }
  }
}
