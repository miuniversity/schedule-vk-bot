import { Keyboard } from 'vk-io';
import { EVENTS } from '../utils/eventFilter';

export const simpleButtons = Keyboard.builder()
  .inline()
  .textButton({
    label: 'Меню',
    payload: {
      event: EVENTS.MENU,
    },
  });

export const searchingGroupList = (groups: { label: string; id: number }[]) => {
  const bulider = Keyboard.builder().inline();

  groups.map((group) => {
    bulider
      .textButton({
        label: group.label,
        payload: {
          group_id: group.id,
        },
      })
      .row();
  });

  return bulider;
};
