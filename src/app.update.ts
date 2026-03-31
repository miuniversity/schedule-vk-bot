import { Keyboard, MessageContext } from 'vk-io';
import { Ctx, Hears, Update, } from 'nestjs-vk';

import {
  MESSAGES,
  SELECT_GROUP_WIZARD,
} from './app.constants';
import { UsersService } from './users/users.service';

const keyboard = Keyboard.builder().textButton({
  label: MESSAGES['ru'].MENU,
  color: Keyboard.PRIMARY_COLOR,
}).row();

@Update()
export class AppUpdate {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @Hears([/start/i, /начать/i])
  async onStart(@Ctx() ctx: MessageContext) {
    await ctx.reply(MESSAGES.ru.GREETING);

    const user = await this.usersService.getInfo(ctx.peerId);
    if (!user) {
      await ctx.scene.enter(SELECT_GROUP_WIZARD);
      return;
    }

    if (user.is_inactive) {
      await this.usersService.editInfo(ctx.peerId, {
        inactive_reason: null,
        is_inactive: false,
      });
      await ctx.send({
        message: MESSAGES['ru'].ACTIVITY_RESTORATION,
        keyboard
      });
      return;
    }

    await ctx.send({
      message: MESSAGES['ru'].ALREADY_REGISTERED,
      keyboard
    });
  }

  @Hears([/help/i, /помощь/i])
  async onHelp(@Ctx() ctx: MessageContext) {
    await ctx.send(MESSAGES['ru'].HELP_INFO);
  }
}
