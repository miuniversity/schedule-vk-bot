import { Logger } from '@nestjs/common';
import { MessageContext, VK } from 'vk-io';
import { MessagesEditParams } from 'vk-io/lib/api/schemas/params';

export async function editMessage(
  vk: VK,
  ctx: MessageContext,
  text: MessageContext['message']['text'],
  options?: Omit<MessagesEditParams, 'peer_id' | 'message_id' | 'message'>,
) {
  const logger = new Logger('editMessage');

  try {
    // if (ctx && !ctx) {
    //   checkMessage(message);
    //   await ctx.editMessage();
    //   return await ctx.telegram.editMessageText(
    //     ctx.chat.id,
    //     message.message_id,
    //     undefined,
    //     text,
    //     options,
    //   );
    // }

    return await vk.api.messages.edit({
      peer_id: ctx.peerId,
      message_id: ctx.id,
      message: text,
      ...options,
    });
  } catch (err: any) {
    if (err.hasOwnProperty('error_code')) {
      if (err.error_code === 400) {
        return false;
      }
    }

    logger.error(`Failed to edit message for ${ctx.chat.id}`);
    logger.error(err ?? 'Unknown error');
    return false;
  }
}
