import { Keyboard } from 'vk-io';
import { EVENTS } from '../utils/eventFilter';

export const mainMenu = Keyboard.builder()
  .inline()
  .callbackButton({
    label: 'На день',
    payload: {
      event: EVENTS.SCHEDULE_DAY,
      date: 'current',
    },
    color: Keyboard.PRIMARY_COLOR,
  })
  .callbackButton({
    label: 'На неделю',
    payload: {
      event: EVENTS.SCHEDULE_WEEK,
      date: 'current',
    },
    color: Keyboard.PRIMARY_COLOR,
  })
  .row()
  .callbackButton({
    label: 'Преподаватель',
    payload: {
      event: EVENTS.SELECT_LECTURER,
    },
    color: Keyboard.SECONDARY_COLOR,
  })
  .row()
  .textButton({
    label: 'Карта ГК',
  })
  .row()
  .urlButton({
    label: 'ЛК',
    url: 'https://elearn.mmu.ru',
  })
  .textButton({
    label: 'FAQ',
  })
  .row()
  .textButton({
    label: 'Настройки',
  })
  .row();
