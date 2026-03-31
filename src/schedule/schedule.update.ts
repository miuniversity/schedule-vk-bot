import { Ctx, Hears, Next, Update } from 'nestjs-vk';
import { MessageContext } from 'vk-io';

import { ScheduleService } from './schedule.service';
import { dayController, weekController } from './schedule.buttons';
import { UsersService } from '../users/users.service';
import { MESSAGES } from '../app.constants';
import { getDayOfWeek } from 'src/utils/getDayOfWeek';
import { NextFunction } from 'express';

@Update()
// @UseInterceptors(new LoggingInterceptor())
export class ScheduleUpdate {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly usersService: UsersService,
  ) { }

  @Hears([/день/i, /след/i, /пред/i, /сегодня/i, /пн/i, /вт/i, /ср/i, /чт/i, /пт/i, /сб/i, /вс/i])
  async getForDay(@Ctx() ctx: MessageContext, @Next() next: NextFunction) {
    if (!('day' in ctx.messagePayload)) {
      return next()
    }

    await ctx.setActivity();

    const user = await this.usersService.getInfo(ctx.peerId);

    if (!user) {
      await ctx.send(MESSAGES['ru'].GROUP_NOT_SELECTED);
      return;
    }

    await this.usersService.checkUserDataUpdated({ id: ctx.peerId });

    const payload = ctx.messagePayload?.day;
    const date = new Date(payload === 'current' ? Date.now() : payload);
    const data = await this.scheduleService.fetchSchedule(
      user.group_id,
      date,
      'day',
    );

    await ctx.send(
      data instanceof Error
        ? MESSAGES['ru'].NO_ANSWER_RETRY
        : this.scheduleService.prepareTextMessageForDay(data, date, {
          hide_buildings: user.hide_buildings,
        }),
      {
        keyboard: dayController(date, data instanceof Error),
      },
    );
  }

  @Hears([/недел/i, /след/i, /пред/i, /текущая/i])
  async getForWeek(@Ctx() ctx: MessageContext, @Next() next: NextFunction) {
    if (!('week' in ctx.messagePayload)) {
      return next()
    }

    await ctx.setActivity();

    const user = await this.usersService.getInfo(ctx.peerId);

    if (!user) {
      await ctx.send(MESSAGES['ru'].GROUP_NOT_SELECTED);
      return;
    }
    await this.usersService.checkUserDataUpdated({ id: ctx.peerId });

    const payload = ctx.messagePayload?.week;
    const date = new Date(payload === 'current' ? Date.now() : payload);
    const data = await this.scheduleService.fetchSchedule(
      user.group_id,
      date,
      'week',
    );

    await ctx.send(
      data instanceof Error
        ? MESSAGES['ru'].NO_ANSWER_RETRY
        : user.detail_week
          ? this.scheduleService.prepareTextMessageForDay(data, date, {
            hide_buildings: user.hide_buildings,
          })
          : this.scheduleService.prepareTextMessageForWeek(data, date, {
            hide_buildings: user.hide_buildings,
          }),
      {
        keyboard: weekController(date, {
          hasError: data instanceof Error,
          days:
            data instanceof Error
              ? []
              : data
                .map((i) => i.date)
                .filter((x, i, a) => a.indexOf(x) === i)
                .map((i) => ({
                  date: new Date(i),
                  name: getDayOfWeek(new Date(i), true),
                })),
        }),
      },
    );
  }
}
