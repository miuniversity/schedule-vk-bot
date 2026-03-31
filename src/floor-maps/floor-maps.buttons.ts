import { Keyboard } from 'vk-io';

export const floorMapsMenuButtons =
  Keyboard.builder().inline()
    .textButton({
      label: '1 этаж',
    })
    .textButton({
      label: '2 этаж',
    })
    .textButton({
      label: '3 этаж',
    })
    .row()
    .textButton({
      label: '4 этаж',
    })
    .textButton({
      label: '5 этаж',
    })
    .textButton({
      label: '6 этаж',
    })
