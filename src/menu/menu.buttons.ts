import { Keyboard } from "vk-io";

export const mainMenu = Keyboard.builder().inline()
  .textButton({
    label: 'На день',
    payload: {
      day: 'current',
    },
    color: Keyboard.PRIMARY_COLOR,
  })
  .textButton({
    label: 'На неделю',
    payload: {
      week: 'current',
    },
    color: Keyboard.PRIMARY_COLOR,
  })
  .row()
  .textButton({
    label: 'Преподаватель',
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
  .row()

