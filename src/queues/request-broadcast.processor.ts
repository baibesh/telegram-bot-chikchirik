import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { Buffer } from 'node:buffer';

export function makeStartAppLink(route: string) {
  const encoded = Buffer
    .from(route)
    .toString('base64url'); // '/performer/requests' → 'L3BlcmZvcm1lci9yZXF1ZXN0cw'
  return `https://t.me/Chikchirik_bird_bot?startapp=${encoded}`;
}

@Processor('request-broadcast')
@Injectable()
export class RequestBroadcastProcessor {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @Process('send-group-message')
  async handleSendGroupMessage(job: Job<{ groupId: string; message: string }>) {
    const { groupId, message } = job.data;

    const link = makeStartAppLink('/performer/requests');

    const keyboard = Markup.inlineKeyboard([
      Markup.button.url('Откликнуться', link)
    ]);

    try {
      await this.bot.telegram.sendMessage(groupId, message, {
        parse_mode: 'HTML',
        reply_markup: keyboard.reply_markup
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
