import { Ctx, InjectVkApi, Next, On, Update } from 'nestjs-vk';
import { NextFunction } from 'express';
import { MessageEventContext, VK } from 'vk-io';

import { ScheduleService } from './schedule.service';
import { dayController, weekController } from './schedule.buttons';
import { UsersService } from '../users/users.service';
import { MESSAGES } from '../app.constants';
import { getDayOfWeek } from 'src/utils/getDayOfWeek';
import eventFilter, { EVENTS } from 'src/utils/eventFilter';

@Update()
export class ScheduleUpdate {
  constructor(
    @InjectVkApi() readonly vk: VK,
    private readonly scheduleService: ScheduleService,
    private readonly usersService: UsersService,
  ) {}

  @On('message_event', eventFilter)
  async getForDay(@Ctx() ctx: MessageEventContext, @Next() next: NextFunction) {
    if (ctx.eventPayload.event !== EVENTS.SCHEDULE_DAY) {
      return next();
    }

    await this.vk.api.messages.edit({
      peer_id: ctx.peerId,
      cmid: ctx.conversationMessageId,
      message: MESSAGES['ru'].FETCHING,
    });

    const user = await this.usersService.getInfo(ctx.peerId);

    if (!user) {
      await ctx.send(MESSAGES['ru'].GROUP_NOT_SELECTED);
      return;
    }

    const payload = ctx.eventPayload.date;
    const date = new Date(payload === 'current' ? Date.now() : payload);
    const data = await this.scheduleService.fetchSchedule(
      user.group_id,
      date,
      'day',
    );

    if (ctx.eventPayload) {
      await this.vk.api.messages.edit({
        peer_id: ctx.peerId,
        cmid: ctx.conversationMessageId,
        message:
          data instanceof Error
            ? MESSAGES['ru'].NO_ANSWER_RETRY
            : this.scheduleService.prepareTextMessageForDay(data, date, {
                hide_buildings: user.hide_buildings,
              }),
        keyboard: dayController(date, data instanceof Error),
      });
      return;
    }

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

  @On('message_event', eventFilter)
  async getForWeek(
    @Ctx() ctx: MessageEventContext,
    @Next() next: NextFunction,
  ) {
    if (ctx.eventPayload.event !== EVENTS.SCHEDULE_WEEK) {
      return next();
    }

    await this.vk.api.messages.edit({
      peer_id: ctx.peerId,
      cmid: ctx.conversationMessageId,
      message: MESSAGES['ru'].FETCHING,
    });

    const user = await this.usersService.getInfo(ctx.peerId);

    if (!user) {
      await ctx.send(MESSAGES['ru'].GROUP_NOT_SELECTED);
      return;
    }

    const payload = ctx.eventPayload.date;
    const date = new Date(payload === 'current' ? Date.now() : payload);
    const data = await this.scheduleService.fetchSchedule(
      user.group_id,
      date,
      'week',
    );

    const message =
      data instanceof Error
        ? MESSAGES['ru'].NO_ANSWER_RETRY
        : this.scheduleService[
            user.detail_week
              ? 'prepareTextMessageForDay'
              : 'prepareTextMessageForWeek'
          ](data, date, {
            hide_buildings: user.hide_buildings,
          });

    const keyboard = weekController(date, {
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
    });

    await this.vk.api.messages.edit({
      peer_id: ctx.peerId,
      cmid: ctx.conversationMessageId,
      message,
      keyboard,
    });
  }
}
