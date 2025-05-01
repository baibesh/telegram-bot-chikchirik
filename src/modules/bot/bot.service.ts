import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { SceneContext } from 'telegraf/typings/scenes';
import { ClientInterface } from '../../common/interfaces/client.interface';

@Injectable()
export class BotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly httpService: HttpService,
  ) {}

  async createClient(ctx: Context & SceneContext, client: ClientInterface) {
    try {
      return await firstValueFrom(
        this.httpService.post(
          `${process.env.DIRECTUS_BASE}/items/practicum_users`,
          client,
        ),
      );
    } catch (err) {
      await this.forwardToAdmin(
        'Create' + JSON.stringify(client) + ' ' + err.message,
      );
    }
  }

  async getClient(telegram_id: number) {
    try {
      const url = `${process.env.DIRECTUS_BASE}/items/practicum_users?filter[telegram_id][_eq]=${telegram_id}&fields=*.*`;
      const { data: students } = await firstValueFrom(
        this.httpService.get(url),
      );
      return students.data[0];
    } catch (err) {
      await this.forwardToAdmin(
        'Get' + JSON.stringify(telegram_id) + ' ' + err.message,
      );
    }
  }

  async forwardToAdmin(details: string) {
    try {
      await this.bot.telegram.sendMessage(process.env.ADMIN, details);
    } catch (err) {
      console.error(err.message);
    }
  }

  async sendMessage(details: string) {
    try {
      await this.bot.telegram.sendMessage('-1002583193450', details);
    } catch (err) {
      console.error(err.message);
    }
  }

  getFutureDays(today: Date, days_to_add: number) {
    const future_date = new Date(today);
    future_date.setDate(today.getDate() + days_to_add);
    return future_date;
  }
}
