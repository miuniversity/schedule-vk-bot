import { Keyboard } from 'vk-io';
import { UserEntity } from '../users/user.entity';

export function settingsController({ user }: { user: Partial<UserEntity> }) {
  const kbdBuilder = Keyboard.builder().inline();

  kbdBuilder
    .textButton({
      label: `Сменить группу | ${user.group_name}`,
    })
    .row()
    .textButton({
      label: `Подробная неделя | ${user.detail_week ? 'Вкл' : 'Выкл'}`,
      payload: { state: user.detail_week },
      color: user.detail_week ? Keyboard.POSITIVE_COLOR : Keyboard.NEGATIVE_COLOR,
    })
    .row()
    .textButton({
      label: `Показывать корпус | ${user.hide_buildings ? 'Выкл' : 'Вкл'}`,
      payload: { state: user.hide_buildings },
      color: !user.hide_buildings ? Keyboard.POSITIVE_COLOR : Keyboard.NEGATIVE_COLOR,
    })

  return kbdBuilder
}
