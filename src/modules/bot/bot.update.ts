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
    const greetingIcon = '👋';
    const message = `
${greetingIcon} <b>Добро пожаловать! Я — Чик-Чирик, твоя быстрая птичка-курьер!</b>

Здесь ты сможешь легко найти фотографов, видеографов и монтажёров для своих проектов.
Оставляй заявку, и исполнители сами откликнутся! 📩🐦
    `;
    await ctx.replyWithHTML(message, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Я заказчик', web_app: { url: 'https://app.firmachi.kz/' } },
            { text: 'Я исполнитель', web_app: { url: 'https://app.firmachi.kz/become-performer' } }
          ]
        ]
      }
    });
  }

  @Hears('/menu')
  async menu(@Ctx() ctx: SceneContext & Context) {
    await ctx.reply('This is a menu', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Enter Base', callback_data: 'enter_base' }],
        ],
      },
    });
  }

  @Hears('/remove')
  async remove(@Ctx() ctx: SceneContext & Context) {
    await ctx.reply('Session is CLEAR');
    ctx.session = null;
  }

  @Action('enter_base')
  async enter_base(@Ctx() ctx: SceneContext & Context) {
    await ctx.scene.enter('base');
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
