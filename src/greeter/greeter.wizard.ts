import { MessageContext, MessageEventContext } from 'vk-io';
import { AddStep, Ctx, On, Scene, SceneEnter } from 'nestjs-vk';
import { IStepContext } from '@vk-io/scenes';

import { MESSAGES, SELECT_GROUP_WIZARD } from '../app.constants';
import { SearchResponseData } from '../api/api.interface';
import { ApiService } from 'src/api/api.service';
import { searchingGroupList } from './greeter.buttons';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/user.entity';

type GreetingState = {
  groups: SearchResponseData[];
  status: 'idle' | 'search';
}

@Scene(SELECT_GROUP_WIZARD)
export class GreeterWizard {
  constructor(
    readonly apiService: ApiService,
    readonly usersService: UsersService,
  ) { }

  @SceneEnter()
  async onStart(@Ctx() ctx: MessageContext & IStepContext<GreetingState>) {
    ctx.scene.state.groups ??= [];
    ctx.scene.state.status ??= 'idle';
  }

  @AddStep(1)
  async step1(@Ctx() ctx: MessageContext & IStepContext<GreetingState>) {
    if (ctx.scene.step.firstTime) {
      await ctx.send(MESSAGES['ru'].ENTER_GROUP);
      return;
    }

    const searchString = ctx.text;

    if (searchString && ctx.scene.state.status !== 'search') {
      const msg = await ctx.send(MESSAGES['ru'].SEARCHING);
      await ctx.setActivity()

      ctx.scene.state.status = 'search';
      const groups = await this.apiService.search({
        payload: { term: searchString, type: 'group' },
      }).finally(() => ctx.scene.state.status = 'idle');

      if (groups instanceof Error) {
        await msg.editMessage({
          message: MESSAGES['ru'].ERROR_RETRY,
        });
        return;
      }

      if (!groups.length) {
        await msg.editMessage({
          message: MESSAGES['ru'].NO_GROUPS_FOUND,
        });
        return;
      }

      if (groups.length > 5) {
        await msg.editMessage({
          message: MESSAGES['ru'].MANY_GROUPS_FOUND,
        });
        return;
      }

      ctx.scene.state.groups = groups;
      await msg.editMessage({
        message: MESSAGES['ru'].SELECT_GROUP,
        keyboard: searchingGroupList(groups),
      });
      return ctx.scene.step.next({ silent: true });
    }
  }

  @AddStep(2)
  async step2(@Ctx() ctx: MessageEventContext & IStepContext<GreetingState>) {
    if (ctx.scene.step.firstTime && ctx.messagePayload) {
      const group_id = ctx.messagePayload.group_id;

      const selected_group = ctx.scene.state.groups.find(
        (g: any) => String(g.id) === String(group_id),
      );

      const user_from_db = await this.usersService.getInfo(ctx.peerId);
      const payload: Omit<UserEntity, 'id' | 'updated_at' | 'created_at'> = {
        uid: String(ctx.peerId),
        group_id: parseInt(group_id),
        group_name: selected_group.label,
        // first_name: user.first_name,
        // last_name: user.last_name,
        // username: user.username,
        register_source: 'directly',
      };

      if (user_from_db) {
        payload.register_source = user_from_db?.register_source;
        await this.usersService.editInfo(ctx.peerId, payload);
      } else {
        await this.usersService.register(payload);
      }

      await ctx.send(MESSAGES['ru'].GROUP_SELECTED(selected_group.label));
      return ctx.scene.leave();
    }
    return ctx.scene.step.go(0);
  }
}
