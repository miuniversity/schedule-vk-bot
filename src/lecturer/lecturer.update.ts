import { Ctx, Hears, Update } from 'nestjs-vk';
import { MessageContext } from 'vk-io';

import { MESSAGES, SELECT_LECTURER_WIZARD } from '../app.constants';
import { LecturerService } from './lecturer.service';
import { lecturerController } from './lecturer.buttons';

@Update()
export class LecturerUpdate {

  constructor(private readonly lecturerService: LecturerService) { }

  @Hears([/преподаватель/i, /выбрать другого/i])
  async searchLecturer(@Ctx() ctx: MessageContext) {
    await ctx.scene.enter(SELECT_LECTURER_WIZARD);
  }

  @Hears([/текущая/i, /след/i, /пред/i, /получить расписание/i])
  async getLecturerSchedule(@Ctx() ctx: MessageContext) {
    if (!('lecturer_id' in ctx.messagePayload)) return;

    await ctx.setActivity();

    const lecturer_id = ctx.messagePayload?.lecturer_id;
    const date = new Date(ctx.messagePayload?.date === 'current' ? Date.now() : ctx.messagePayload?.date);
    const selected_lecturer = await this.lecturerService.getLecturerSchedule(lecturer_id, date);

    if (selected_lecturer instanceof Error) {
      await ctx.send(MESSAGES['ru'].NO_ANSWER_RETRY);
      return;
    }

    await ctx.send({
      message: this.lecturerService.prepareTextMessageForLecturer(selected_lecturer, date),
      keyboard: lecturerController(lecturer_id, date),
    });

    // if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const [_keyword, lecturer_id, _date, new_message] =
    //     ctx.callbackQuery.data.split('-');

    //   const message = new_message
    //     ? await ctx.reply(MESSAGES['ru'].FETCHING)
    //     : await editMessage(ctx, MESSAGES['ru'].FETCHING);

    //   const date = new Date(_date === 'current' ? Date.now() : _date);

    //   const data = await this.lecturerService.getLecturerSchedule(
    //     parseInt(lecturer_id),
    //     date,
    //   );

    //   const text =
    //     data instanceof Error
    //       ? MESSAGES['ru'].NO_ANSWER_RETRY
    //       : this.lecturerService.prepareTextMessageForLecturer(data, date);
    //   const options: ExtraEditMessageText = {
    //     reply_markup: lecturerController(
    //       parseInt(lecturer_id),
    //       date,
    //       data instanceof Error,
    //     ).reply_markup,
    //     parse_mode: 'HTML',
    //   };

    //   if (new_message) {
    //     await ctx.telegram.editMessageText(
    //       ctx.chat.id,
    //       (message as { message_id: number }).message_id,
    //       undefined,
    //       text,
    //       options,
    //     );
    //     return;
    //   }

    //   await editMessage(ctx, text, options);
    // }
  }
}
