import { formatDate } from '../utils/formatDate';
import { addWeeks, isThisWeek } from 'date-fns';
import { EVENTS } from 'src/utils/eventFilter';
import { Keyboard } from 'vk-io';

export const searchingLecturerList = (lecturers: { label: string; id: number }[]) => {
  const kbdBuilder = Keyboard.builder().inline();

  lecturers.forEach((lecturer) => {
    kbdBuilder
      .textButton({
        label: lecturer.label,
        payload: {
          event: EVENTS.SELECT_LECTURER,
          lecturer_id: lecturer.id,
        },
        color: Keyboard.PRIMARY_COLOR,
      })
      .row()
  })

  kbdBuilder
    .textButton({
      label: 'Отмена',
      payload: { event: EVENTS.CANCEL },
    })
    .row()

  return kbdBuilder
}

export const requestLecturerSchedule = (lecturer_id: number, date: Date) => {
  const kbdBuilder = Keyboard.builder().inline();

  kbdBuilder
    .callbackButton({
      label: 'Получить расписание',
      payload: {
        event: EVENTS.SCHEDULE_LECTURER,
        lecturer_id: lecturer_id,
        date: 'current',
        noDelete: true,
      }
    })
    .row()
    .callbackButton({
      label: 'Выбрать другого',
      payload: {
        event: EVENTS.SELECT_LECTURER,
        noDelete: true,
      }
    })
    .row()

  return kbdBuilder
}

export const lecturerController = (
  lecturer_id: number,
  date: Date,
  hasError = false,
) => {
  const kbdBuilder = Keyboard.builder().inline();

  if (hasError) {
    kbdBuilder
      .callbackButton({
        label: 'Повторить попытку',
        payload: {
          event: EVENTS.SCHEDULE_LECTURER,
          lecturer_id: lecturer_id,
          date: formatDate(date),
        }
      })
      .row()
  }

  kbdBuilder
    .callbackButton({
      label: 'Пред.',
      payload: {
        event: EVENTS.SCHEDULE_LECTURER,
        lecturer_id: lecturer_id,
        date: formatDate(addWeeks(date, -1)),
      },
      color: Keyboard.PRIMARY_COLOR,
    })
    .callbackButton({
      label: 'След.',
      payload: {
        event: EVENTS.SCHEDULE_LECTURER,
        lecturer_id: lecturer_id,
        date: formatDate(addWeeks(date, 1)),
      },
      color: Keyboard.PRIMARY_COLOR,
    })
    .row()

  if (!isThisWeek(date, { weekStartsOn: 1 })) {
    kbdBuilder
      .callbackButton({
        label: 'Текущая',
        payload: {
          event: EVENTS.SCHEDULE_LECTURER,
          lecturer_id: lecturer_id,
          date: 'current',
        },
      })
  }


  kbdBuilder
    .textButton({
      label: 'Меню',
      payload: {
        event: EVENTS.MENU,
      },
    })
    .row()

  return kbdBuilder;
}