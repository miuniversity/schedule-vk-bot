import { Ctx, Hears, Update } from 'nestjs-vk';
import { MessageContext, MessageEventContext } from 'vk-io';

import { FaqService } from './faq.service';
import { UsersService } from '../users/users.service';
import { MESSAGES } from '../app.constants';

@Update()
export class FaqUpdate {
  constructor(
    private readonly usersService: UsersService,
    private readonly faqService: FaqService,
  ) { }

  @Hears([/faq/i])
  async getFaq(@Ctx() ctx: MessageContext | MessageEventContext) {
    await ctx.setActivity();

    const user = await this.usersService.getInfo(ctx.peerId);
    const [faqData] = await this.faqService.getFaq([user?.language || 'ru']);

    await ctx.send({
      message: faqData?.value || MESSAGES[user?.language || 'ru'].FAQ_TEXT_NOT_FOUND,
      dont_parse_links: 1,
    })
  }
}
