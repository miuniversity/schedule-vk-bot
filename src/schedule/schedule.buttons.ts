import { Markup } from 'telegraf';
import { formatDate } from '../utils/formatDate';
import { addDays, addWeeks, isThisWeek, isToday } from 'date-fns';
import { Keyboard, KeyboardBuilder } from 'vk-io';

export const emptyController = () =>
  Markup.inlineKeyboard([Markup.button.callback('Меню', 'menu')]);

export const dayController = (date: Date, hasError = false) => {
  const kbdBuilder = Keyboard.builder().inline();

  if (hasError) {
    kbdBuilder
      .textButton({
        label: 'Повторить попытку',
        payload: {
          day: formatDate(date),
        }
      }).row()
  }

  kbdBuilder
    .textButton({
      label: 'Пред.',
      payload: {
        day: formatDate(addDays(date, -1)),
      },
      color: Keyboard.PRIMARY_COLOR,
    })
    .textButton({
      label: 'След.',
      payload: {
        day: formatDate(addDays(date, 1)),
      },
      color: Keyboard.PRIMARY_COLOR,
    })
    .row()
    .textButton({
      label: 'Неделя',
      payload: {
        week: formatDate(date),
      }
    })

  if (!isToday(date)) {
    kbdBuilder
      .textButton({
        label: 'Сегодня',
        payload: {
          day: 'current',
        }
      })
  }

  kbdBuilder.textButton({
    label: 'Меню',
    payload: {
      menu: 'menu',
    }
  })
    .row()

  return kbdBuilder;
}

export const weekController = (
  date: Date,
  options?: { hasError?: boolean; days?: { date: Date; name: string }[] },
) => {
  const kbgBuilder = Keyboard.builder().inline();

  if (options.days?.length) {
    options?.days?.forEach((day, index) => {
      kbgBuilder.textButton({
        label: day.name,
        payload: { day: formatDate(day.date) },
        color: Keyboard.PRIMARY_COLOR,
      })

      if (options.days.length > 5 && index % 4 === 0 && index !== 0) {
        kbgBuilder.row();
      }
    });

    kbgBuilder.row();
  }

  if (options.hasError) {
    kbgBuilder
      .textButton({
        label: 'Повторить попытку',
        payload: {
          week: formatDate(date),
        }
      }).row()
  }

  kbgBuilder
    .textButton({
      label: 'Пред.',
      payload: {
        week: formatDate(addWeeks(date, -1)),
      }
    })
    .textButton({
      label: 'След.',
      payload: {
        week: formatDate(addWeeks(date, 1)),
      }
    })
    .row()

  if (!isThisWeek(date, { weekStartsOn: 1 })) {
    kbgBuilder.textButton({
      label: 'Текущая',
      payload: {
        week: 'current',
      }
    })
  } else {
    kbgBuilder.textButton({
      label: 'Сегодня',
      payload: {
        day: 'current',
      }
    })
  }

  kbgBuilder
    .textButton({
      label: 'Меню',
      payload: {
        menu: 'menu',
      }
    })
    .row()

  return kbgBuilder;
};
