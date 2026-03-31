import { Ctx, Hears, Update } from 'nestjs-vk';
import { MessageContext } from 'vk-io';

import { UsersService } from './users.service';
import { MESSAGES } from '../app.constants';

@Update()
export class UsersUpdate {
  constructor(private readonly usersService: UsersService) { }

  @Hears([/^me/i])
  async getMe(@Ctx() ctx: MessageContext) {
    const user = await this.usersService.getInfo(ctx.peerId);
    await ctx.reply(
      user
        ? `id: ${user.id}\n` +
        `uid: ${user.uid}\n` +
        `username: ${user.username}\n` +
        `group: ${user.group_name}\n` +
        `language: ${user.language}\n` +
        `created: ${user.created_at.toLocaleString()}`
        : MESSAGES['ru'].NOT_REGISTERED,
    );
  }

  @Hears([/\!remove me/i])
  async debugRemove(@Ctx() ctx: MessageContext) {
    await this.usersService.remove(ctx.peerId);
    await ctx.reply(MESSAGES['ru'].PROFILE_REMOVED);
  }
}
