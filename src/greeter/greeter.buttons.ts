import { Keyboard } from "vk-io";

export const searchingGroupList = (groups: { label: string; id: number }[]) => {
  const bulider = Keyboard.builder().inline()

  groups.map(group => {
    bulider.textButton({
      label: group.label,
      payload: {
        group_id: group.id
      }
    }).row()
  })

  return bulider
}
