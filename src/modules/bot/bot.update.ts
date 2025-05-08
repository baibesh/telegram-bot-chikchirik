import { Injectable } from '@nestjs/common';
import {
  Action,
  Ctx,
  Hears,
  InjectBot,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';
import { SceneContext } from 'telegraf/typings/scenes';

@Injectable()
@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly botService: BotService,
  ) {}

  @Start()
  async start(@Ctx() ctx: SceneContext & Context) {
    const message = `
👋 Добро пожаловать! Я — Чик-Чирик, твоя быстрая птичка-курьер!

🐦 Я помогаю заказчиком легко и быстро найти исполнителей. 

👇Выбери свою роль и продолжай!
    `;
    await ctx.replyWithHTML(message, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Я заказчик', web_app: { url: 'https://mini.firmachi.kz/' } },
            { text: 'Я исполнитель', callback_data: 'become_performer' }
          ]
        ]
      }
    });
  }

  @Action('become_performer')
  async becomePerformer(@Ctx() ctx: SceneContext & Context) {
    const message = `
📢 <b>Важная информация для исполнителей!</b>

✅ Для получения уведомлений о новых заказах, пожалуйста, подпишитесь на наш канал: <a href="https://t.me/chikchirikbird">@chikchirikbird</a>

👤 Также необходимо заполнить свой профиль, чтобы заказчики могли видеть вашу информацию.

🔽 Нажмите на кнопки ниже:
    `;

    await ctx.answerCbQuery();
    await ctx.replyWithHTML(message, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Подписаться на канал', url: 'https://t.me/chikchirikbird' }
          ],
          [
            { text: 'Заполнить профиль', web_app: { url: 'https://mini.firmachi.kz/become-performer' } }
          ]
        ]
      }
    });
  }

  @On('my_chat_member')
  async onMyChatMember(@Ctx() ctx: Context) {
    const myChatMember = ctx.myChatMember;
    if (myChatMember) {
      const chatId = myChatMember.chat?.id;
      // Дополнительная проверка: если новый статус - "member" или "administrator", значит бот был добавлен
      const newStatus = myChatMember.new_chat_member?.status;
      if (newStatus === 'member' || newStatus === 'administrator') {
        console.log(`Бот добавлен в чат с id: ${chatId}`);
        // Здесь можно сохранить chatId или выполнить другие действия
      }
    }
  }
}
