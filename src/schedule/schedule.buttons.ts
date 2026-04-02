import { formatDate } from '../utils/formatDate';
import { addDays, addWeeks, isThisWeek, isToday } from 'date-fns';
import { EVENTS } from 'src/utils/eventFilter';
import { Keyboard } from 'vk-io';

export const dayController = (date: Date, hasError = false) => {
  const kbdBuilder = Keyboard.builder().inline();

  if (hasError) {
    kbdBuilder
      .callbackButton({
        label: 'Повторить попытку',
        payload: {
          event: EVENTS.SCHEDULE_DAY,
          date: formatDate(date),
        },
      })
      .row();
  }

  kbdBuilder
    .callbackButton({
      label: 'Пред.',
      payload: {
        event: EVENTS.SCHEDULE_DAY,
        date: formatDate(addDays(date, -1)),
      },
      color: Keyboard.PRIMARY_COLOR,
    })
    .callbackButton({
      label: 'След.',
      payload: {
        event: EVENTS.SCHEDULE_DAY,
        date: formatDate(addDays(date, 1)),
      },
      color: Keyboard.PRIMARY_COLOR,
    })
    .row()
    .callbackButton({
      label: 'Неделя',
      payload: {
        event: EVENTS.SCHEDULE_WEEK,
        date: formatDate(date),
      },
    });

  if (!isToday(date)) {
    kbdBuilder.callbackButton({
      label: 'Сегодня',
      payload: {
        event: EVENTS.SCHEDULE_DAY,
        date: 'current',
      },
    });
  }

  kbdBuilder
    .textButton({
      label: 'Меню',
      payload: {
        event: EVENTS.MENU,
      },
    })
    .row();

  return kbdBuilder;
};

export const weekController = (
  date: Date,
  options?: { hasError?: boolean; days?: { date: Date; name: string }[] },
) => {
  const kbgBuilder = Keyboard.builder().inline();

  if (options.days?.length) {
    options?.days?.forEach((day, index) => {
      kbgBuilder.callbackButton({
        label: day.name,
        payload: {
          event: EVENTS.SCHEDULE_DAY,
          date: formatDate(day.date),
        },
        color: Keyboard.PRIMARY_COLOR,
      });

      if (options.days.length > 5 && index % 4 === 0 && index !== 0) {
        kbgBuilder.row();
      }
    });

    kbgBuilder.row();
  }

  if (options.hasError) {
    kbgBuilder
      .callbackButton({
        label: 'Повторить попытку',
        payload: {
          event: EVENTS.SCHEDULE_WEEK,
          date: formatDate(date),
        },
      })
      .row();
  }

  kbgBuilder
    .callbackButton({
      label: 'Пред.',
      payload: {
        event: EVENTS.SCHEDULE_WEEK,
        date: formatDate(addWeeks(date, -1)),
      },
    })
    .callbackButton({
      label: 'След.',
      payload: {
        event: EVENTS.SCHEDULE_WEEK,
        date: formatDate(addWeeks(date, 1)),
      },
    })
    .row();

  if (!isThisWeek(date, { weekStartsOn: 1 })) {
    kbgBuilder.callbackButton({
      label: 'Текущая',
      payload: {
        event: EVENTS.SCHEDULE_WEEK,
        date: 'current',
      },
    });
  } else {
    kbgBuilder.callbackButton({
      label: 'Сегодня',
      payload: {
        event: EVENTS.SCHEDULE_DAY,
        date: 'current',
      },
    });
  }

  kbgBuilder
    .textButton({
      label: 'Меню',
      payload: {
        event: EVENTS.MENU,
      },
    })
    .row();

  return kbgBuilder;
};
