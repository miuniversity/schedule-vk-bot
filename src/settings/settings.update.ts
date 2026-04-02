import { Ctx, Hears, InjectVkApi, Next, On, Update } from 'nestjs-vk';
import { MessageContext, MessageEventContext, VK } from 'vk-io';
import { NextFunction } from 'express';

import { settingsController } from './settings.buttons';
import { UsersService } from '../users/users.service';
import { MESSAGES, SELECT_GROUP_WIZARD } from '../app.constants';
import eventFilter, { EVENTS } from 'src/utils/eventFilter';

@Update()
export class SettingsUpdate {
  constructor(@InjectVkApi() readonly vk: VK, private readonly usersService: UsersService) { }

  @Hears([/настройки/i])
  async onSettings(@Ctx() ctx: MessageContext, @Next() next: NextFunction) {
    if (!!ctx.isOutbox) { return next(); }

    await ctx.setActivity();

    const user = await this.usersService.getInfo(ctx.peerId);

    if (!user) {
      await ctx.send(MESSAGES['ru'].NOT_REGISTERED_FOR_SETTINGS);
      return;
    }

    await ctx.send({
      message: MESSAGES['ru'].SETTINGS,
      keyboard: settingsController({ user }),
    });
  }

  @On('message_event', eventFilter)
  async changeGroup(@Ctx() ctx: MessageEventContext, @Next() next: NextFunction) {
    if (ctx.eventPayload.event !== EVENTS.SETTINGS) { return next(); }
    if (ctx.eventPayload.action !== 'change-group') { return next(); }

    await ctx.scene.enter(SELECT_GROUP_WIZARD);
  }

  @On('message_event', eventFilter)
  async changeDetailWeek(@Ctx() ctx: MessageEventContext, @Next() next: NextFunction) {
    if (ctx.eventPayload.event !== EVENTS.SETTINGS) { return next(); }
    if (ctx.eventPayload.action !== 'toggle-detail-week') { return next(); }

    const flag = String(ctx.eventPayload.state) === 'true';
    const updated_user = await this.usersService.editInfo(ctx.peerId, {
      detail_week: !flag,
    });

    await this.vk.api.messages.edit({
      peer_id: ctx.peerId,
      cmid: ctx.conversationMessageId,
      message: MESSAGES['ru'].DETAIL_WEEK_SWITCHED(updated_user.detail_week),
      keyboard: settingsController({
        user: updated_user,
      }),
    },
    );
  }

  @On('message_event', eventFilter)
  async changeHideBuildings(@Ctx() ctx: MessageEventContext, @Next() next: NextFunction) {
    if (ctx.eventPayload.event !== EVENTS.SETTINGS) { return next(); }
    if (ctx.eventPayload.action !== 'toggle-hide-buildings') { return next(); }

    const flag = String(ctx.eventPayload.state) === 'true';
    const updated_user = await this.usersService.editInfo(ctx.peerId, {
      hide_buildings: !flag,
    });

    await this.vk.api.messages.edit({
      peer_id: ctx.peerId,
      cmid: ctx.conversationMessageId,
      message: MESSAGES['ru'].HIDE_BUILDINGS_SWITCHED(updated_user.hide_buildings),
      keyboard: settingsController({
        user: updated_user,
      }),
    },
    );
  }

  // @Hears(/получать рассылку/i)
  // async toggleAllowMailing(@Ctx() ctx: MessageContext) {
  //   const flag =
  //     (ctx.callbackQuery as { data: string }).data.split('=')[1] === 'true';
  //   const updated_user = await this.usersService.editInfo(ctx.peerId, {
  //     allow_mailing: flag,
  //   });
  //   await editMessage(
  //     ctx,
  //     MESSAGES['ru'].ALLOW_MAILING_CHANGED(updated_user.allow_mailing),
  //     {
  //       reply_markup: settingsController({
  //         user: updated_user,
  //       }).reply_markup,
  //     },
  //   );
  // }
}
