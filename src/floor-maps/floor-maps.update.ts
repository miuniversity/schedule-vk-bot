import { ConfigService } from '@nestjs/config';

import { Ctx, Hears, InjectVkApi, Update } from 'nestjs-vk';
import { MessageContext, VK } from 'vk-io';

import { MESSAGES } from '../app.constants';
import { floorMapsMenuButtons } from './floor-maps.buttons';

@Update()
export class FloorMapsUpdate {
  constructor(
    @InjectVkApi() readonly vk: VK,
    private readonly configService: ConfigService,
  ) {}

  @Hears([/^карта/i])
  async getFloorMapsMenu(@Ctx() ctx: MessageContext) {
    await ctx.send({
      message: MESSAGES['ru'].FLOOR_MENU,
      keyboard: floorMapsMenuButtons,
    });
  }

  @Hears([/^(\d\s+)?этаж(\s+\d)?$/i])
  async getFloorMap(@Ctx() ctx: MessageContext) {
    const floor = ctx.text.match(/\d/);

    if (!floor || floor.length < 1) {
      return;
    }
    await ctx.setActivity();

    await ctx.sendPhotos({
      value: `${this.configService.get('STATIC_BASE_URL')}/file/floor-${floor[0]}.jpg`,
      contentType: 'image/jpeg',
    });
  }

  @Hears([/^все этажи$/i])
  async getAllFloorMaps(@Ctx() ctx: MessageContext) {
    await ctx.setActivity();

    await ctx.sendPhotos(
      new Array(6).fill(null).map((_, index) => ({
        value: `${this.configService.get('STATIC_BASE_URL')}/file/floor-${index + 1}.jpg`,
        contentType: 'image/jpeg',
      })),
    );
  }
}
