import { Ctx, Hears, Update } from 'nestjs-vk';
import { MessageContext } from 'vk-io';

import { MESSAGES } from '../app.constants';
import { UsersService } from '../users/users.service';
import { mainMenu } from './menu.buttons';

@Update()
export class MenuUpdate {
  constructor(private readonly usersService: UsersService) {}

  @Hears([/меню/i, /menu/i])
  async sendMenu(@Ctx() ctx: MessageContext) {
    await ctx.setActivity();
    const user = await this.usersService.getInfo(ctx.peerId);

    await ctx.send({
      message: MESSAGES[user?.language ?? 'ru'].MENU,
      keyboard: mainMenu,
    });
  }
}
