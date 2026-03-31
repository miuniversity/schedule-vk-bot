import { formatDate } from '../utils/formatDate';
import { addWeeks, isThisWeek } from 'date-fns';
import { Keyboard } from 'vk-io';

export const searchingLecturerList = (lecturers: { label: string; id: number }[]) => {
  const kbdBuilder = Keyboard.builder().inline();

  lecturers.forEach((lecturer) => {
    kbdBuilder
      .textButton({
        label: lecturer.label,
        payload: {
          lecturer_id: lecturer.id,
        },
        color: Keyboard.PRIMARY_COLOR,
      })
      .row()
  })

  kbdBuilder
    .textButton({
      label: 'Отмена',
    })
    .row()

  return kbdBuilder
}

export const requestLecturerSchedule = (lecturer_id: number, date: Date) => {
  const kbdBuilder = Keyboard.builder().inline();

  kbdBuilder
    .textButton({
      label: 'Получить расписание',
      payload: {
        lecturer_id: lecturer_id,
        date: 'current',
      }
    })
    .row()
    .textButton({
      label: 'Выбрать другого',
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
      .textButton({
        label: 'Повторить попытку',
        payload: {
          lecturer_id: lecturer_id,
          date: formatDate(date),
        }
      })
      .row()
  }

  kbdBuilder
    .textButton({
      label: 'Пред.',
      payload: {
        lecturer_id: lecturer_id,
        date: formatDate(addWeeks(date, -1)),
      },
      color: Keyboard.PRIMARY_COLOR,
    })
    .textButton({
      label: 'След.',
      payload: {
        lecturer_id: lecturer_id,
        date: formatDate(addWeeks(date, 1)),
      },
      color: Keyboard.PRIMARY_COLOR,
    })
    .row()

  if (!isThisWeek(date, { weekStartsOn: 1 })) {
    kbdBuilder
      .textButton({
        label: 'Текущая',
        payload: {
          lecturer_id: lecturer_id,
          date: 'current',
        },
      })
  }


  kbdBuilder
    .textButton({
      label: 'Меню',
      payload: {
        lecturer_id: lecturer_id,
        date: 'current',
      },
    })
    .row()

  return kbdBuilder;
}