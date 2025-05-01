import { Injectable } from '@nestjs/common';
import {
  Ctx,
  Hears,
  InjectBot,
  Scene,
  SceneEnter,
  SceneLeave,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { BotService } from '../bot.service';
import { SceneContext } from 'telegraf/typings/scenes';

@Injectable()
@Scene('base')
export class BaseScene {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly botService: BotService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: SceneContext) {
    await ctx.reply('You in BASE. Write /go to go out.');
  }

  @SceneLeave()
  async leave(@Ctx() ctx: SceneContext) {
    await ctx.reply('You out BASE');
  }

  @Hears('/go')
  async go(@Ctx() ctx: SceneContext & Context) {
    await ctx.reply('You are going...');
    await ctx.scene.leave();
  }
}
