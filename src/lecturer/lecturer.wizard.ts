import { AddStep, Ctx, InjectVkApi, Scene, SceneEnter } from 'nestjs-vk';
import { MessageContext, VK } from 'vk-io';
import { IStepContext } from '@vk-io/scenes';

import { MESSAGES, SELECT_LECTURER_WIZARD } from '../app.constants';
import { ApiService } from '../api/api.service';
import {
  lecturerController,
  requestLecturerSchedule,
  searchingLecturerList,
} from './lecturer.buttons';
import { LecturerService } from './lecturer.service';

type LecturerState = {
  lecturers: { label: string; id: number; description: string }[];
  status: 'idle' | 'search';
  cmid?: number;
};

@Scene(SELECT_LECTURER_WIZARD)
export class LecturerWizard {
  constructor(
    @InjectVkApi() readonly vk: VK,
    private readonly lecturerService: LecturerService,
    private readonly apiService: ApiService,
  ) {}

  @SceneEnter()
  async onStart(@Ctx() ctx: MessageContext & IStepContext<LecturerState>) {
    if (ctx.text?.toLocaleLowerCase() === 'отмена') {
      await ctx.send(MESSAGES['ru'].CANCEL_SEARCH);
      return await ctx.scene.leave({
        canceled: true,
      });
    }

    ctx.scene.state.lecturers ??= [];
    ctx.scene.state.status ??= 'idle';
  }

  @AddStep(1)
  async onMessage(@Ctx() ctx: MessageContext & IStepContext<LecturerState>) {
    if (ctx.scene.step.firstTime) {
      await ctx.send(MESSAGES['ru'].ENTER_LECTURER);
      return;
    }
    const searchString = ctx.text;

    if (searchString && ctx.scene.state.status !== 'search') {
      const message = await ctx.send(MESSAGES['ru'].SEARCHING);

      const lecturers = await this.apiService.search({
        payload: { term: searchString, type: 'lecturer' },
      });

      if (lecturers instanceof Error) {
        await message.editMessage({
          message: MESSAGES['ru'].ERROR_RETRY,
          keyboard: searchingLecturerList([]),
        });
        return;
      }

      if (!lecturers.length) {
        await message.editMessage({
          message: MESSAGES['ru'].NO_LECTURER_FOUND,
          keyboard: searchingLecturerList([]),
        });
        return;
      }

      if (lecturers.length > 5) {
        await message.editMessage({
          message: MESSAGES['ru'].MANY_LECTURERS_FOUND,
          keyboard: searchingLecturerList([]),
        });
        return;
      }

      ctx.scene.state.lecturers = lecturers;
      await message.editMessage({
        message: MESSAGES['ru'].SELECT_LECTURER,
        keyboard: searchingLecturerList(lecturers),
      });
      ctx.scene.state.cmid = message.conversationMessageId;
      return await ctx.scene.step.next({ silent: true });
    }
  }

  @AddStep(2)
  async onLecturerSelect(
    @Ctx() ctx: MessageContext & IStepContext<LecturerState>,
  ) {
    await ctx.setActivity();

    const lecturer_id = ctx.messagePayload?.lecturer_id;

    const selected_lecturer = ctx.scene.state.lecturers.find(
      (l) => String(l.id) === String(lecturer_id),
    );

    if (ctx.scene.state.cmid) {
      await this.vk.api.messages.edit({
        peer_id: ctx.peerId,
        cmid: ctx.scene.state.cmid,
        message: MESSAGES['ru'].LECTURER_SELECTED(selected_lecturer.label),
        keyboard: requestLecturerSchedule(parseInt(lecturer_id)),
      });
    } else {
      await ctx.send({
        message: MESSAGES['ru'].LECTURER_SELECTED(selected_lecturer.label),
        keyboard: requestLecturerSchedule(parseInt(lecturer_id)),
      });
    }

    const lessons = await this.lecturerService.getLecturerSchedule(
      parseInt(lecturer_id),
      new Date(),
    );

    await ctx.send({
      message: this.lecturerService.prepareTextMessageForLecturer(lessons),
      keyboard: lecturerController(parseInt(lecturer_id), new Date()),
    });

    return await ctx.scene.leave();
  }
}
