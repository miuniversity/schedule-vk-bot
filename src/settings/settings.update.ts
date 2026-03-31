import { Ctx, Hears, Update } from 'nestjs-vk';
import { MessageContext } from 'vk-io';

import { settingsController } from './settings.buttons';
import { UsersService } from '../users/users.service';
import { MESSAGES, SELECT_GROUP_WIZARD } from '../app.constants';

@Update()
export class SettingsUpdate {
  constructor(private readonly usersService: UsersService) { }
  @Hears([/настройки/i])
  async onSettings(@Ctx() ctx: MessageContext) {
    await ctx.setActivity();

    const user = await this.usersService.getInfo(ctx.peerId);

    if (!user) {
      await ctx.send(MESSAGES['ru'].NOT_REGISTERED_FOR_SETTINGS);
      return;
    }

    await ctx.send(MESSAGES['ru'].SETTINGS, {
      keyboard: settingsController({ user }),
    });
  }

  @Hears(/сменить группу/i)
  async changeGroup(@Ctx() ctx: MessageContext) {
    await ctx.scene.enter(SELECT_GROUP_WIZARD);
  }

  @Hears(/подробная неделя/i)
  async changeDetailWeek(@Ctx() ctx: MessageContext) {
    await ctx.setActivity();

    const flag = String(ctx.messagePayload?.state) === 'true';
    const updated_user = await this.usersService.editInfo(ctx.peerId, {
      detail_week: !flag,
    });

    await ctx.send(
      MESSAGES['ru'].DETAIL_WEEK_SWITCHED(updated_user.detail_week),
      {
        keyboard: settingsController({
          user: updated_user,
        }),
      },
    );
  }

  @Hears(/показывать корпус/i)
  async changeHideBuildings(@Ctx() ctx: MessageContext) {
    await ctx.setActivity();

    const flag = String(ctx.messagePayload?.state) === 'true';
    const updated_user = await this.usersService.editInfo(ctx.peerId, {
      hide_buildings: !flag,
    });

    await ctx.send(
      MESSAGES['ru'].HIDE_BUILDINGS_SWITCHED(updated_user.hide_buildings),
      {
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
