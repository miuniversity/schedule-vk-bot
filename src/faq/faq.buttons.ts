import { EVENTS } from "src/utils/eventFilter";
import { Keyboard } from "vk-io";

export const faqButtons = Keyboard.builder().inline().textButton({
  label: 'Меню',
  payload: {
    event: EVENTS.MENU,
  }
})
