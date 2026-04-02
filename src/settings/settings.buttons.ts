import { Keyboard } from 'vk-io';
import { UserEntity } from '../users/user.entity';
import { EVENTS } from 'src/utils/eventFilter';

export function settingsController({ user }: { user: Partial<UserEntity> }) {
  const kbdBuilder = Keyboard.builder().inline();

  kbdBuilder
    .callbackButton({
      label: `Сменить группу | ${user.group_name}`,
      payload: {
        event: EVENTS.SETTINGS,
        action: 'change-group',
      },
    })
    .row()
    .callbackButton({
      label: `Подробная неделя | ${user.detail_week ? 'Вкл' : 'Выкл'}`,
      payload: {
        event: EVENTS.SETTINGS,
        action: 'toggle-detail-week',
        state: user.detail_week,
      },
      color: user.detail_week
        ? Keyboard.POSITIVE_COLOR
        : Keyboard.NEGATIVE_COLOR,
    })
    .row()
    .callbackButton({
      label: `Показывать корпус | ${user.hide_buildings ? 'Выкл' : 'Вкл'}`,
      payload: {
        event: EVENTS.SETTINGS,
        action: 'toggle-hide-buildings',
        state: user.hide_buildings,
      },
      color: !user.hide_buildings
        ? Keyboard.POSITIVE_COLOR
        : Keyboard.NEGATIVE_COLOR,
    })
    .row()
    .textButton({
      label: 'Меню',
      payload: { event: EVENTS.MENU },
    });

  return kbdBuilder;
}
