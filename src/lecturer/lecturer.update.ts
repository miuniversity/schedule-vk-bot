import { Ctx, InjectVkApi, Next, On, Update } from 'nestjs-vk';
import { MessageEventContext, VK } from 'vk-io';

import { MESSAGES, SELECT_LECTURER_WIZARD } from '../app.constants';
import { LecturerService } from './lecturer.service';
import { lecturerController } from './lecturer.buttons';
import eventFilter, { EVENTS } from 'src/utils/eventFilter';
import { NextFunction } from 'express';

@Update()
export class LecturerUpdate {
  constructor(@InjectVkApi() readonly vk: VK, private readonly lecturerService: LecturerService) { }

  @On('message_event', eventFilter)
  async searchLecturer(@Ctx() ctx: MessageEventContext, @Next() next: NextFunction) {
    if (ctx.eventPayload.event !== EVENTS.SELECT_LECTURER) { return next(); }
    if (!!ctx.eventPayload.lecturer_id) { return next(); }

    if (!ctx.eventPayload.noDelete) {
      await this.vk.api.messages.delete({ peer_id: ctx.peerId, cmids: ctx.conversationMessageId, delete_for_all: 1, spam: 0 });
    } else {
      await this.vk.api.messages.sendMessageEventAnswer({ event_id: ctx.eventId, peer_id: ctx.peerId, user_id: ctx.peerId, event_data: '' });
    }

    await ctx.scene.enter(SELECT_LECTURER_WIZARD);
  }

  @On('message_event', eventFilter)
  async getLecturerSchedule(@Ctx() ctx: MessageEventContext, @Next() next: NextFunction) {
    if (ctx.eventPayload.event !== EVENTS.SCHEDULE_LECTURER) { return next(); }

    const lecturer_id = ctx.eventPayload.lecturer_id;
    const date = new Date(ctx.eventPayload.date === 'current' ? Date.now() : ctx.eventPayload.date);
    const selected_lecturer = await this.lecturerService.getLecturerSchedule(lecturer_id, date);
    if (!ctx.eventPayload.noDelete) {
      if (selected_lecturer instanceof Error) {
        await this.vk.api.messages.edit({
          peer_id: ctx.peerId,
          cmid: ctx.conversationMessageId,
          message: MESSAGES['ru'].NO_ANSWER_RETRY
        });
        return;
      }

      await this.vk.api.messages.edit({
        peer_id: ctx.peerId,
        cmid: ctx.conversationMessageId,
        message: this.lecturerService.prepareTextMessageForLecturer(selected_lecturer, date),
        keyboard: lecturerController(lecturer_id, date),
      });
    } else {
      await this.vk.api.messages.sendMessageEventAnswer({ event_id: ctx.eventId, peer_id: ctx.peerId, user_id: ctx.peerId, event_data: '' });

      if (selected_lecturer instanceof Error) {
        await ctx.send(MESSAGES['ru'].NO_ANSWER_RETRY);
        return;
      }

      await ctx.send({
        message: this.lecturerService.prepareTextMessageForLecturer(selected_lecturer, date),
        keyboard: lecturerController(lecturer_id, date),
      });
    }

  }
}
