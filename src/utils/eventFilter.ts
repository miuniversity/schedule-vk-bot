import { NextFunction } from "express"
import { MessageEventContext } from "vk-io"

export const EVENTS = {
    MENU: 'menu',
    SCHEDULE_DAY: 'schedule-day',
    SCHEDULE_WEEK: 'schedule-week',
    SCHEDULE_LECTURER: 'schedule-lecturer',
    SELECT_LECTURER: 'select-lecturer',
    SETTINGS: 'settings',
    CANCEL: 'cancel',
} as const

export default (ctx: MessageEventContext, next: NextFunction) => {
    if (ctx.eventPayload?.event) { return next(); }
    console.log(ctx)
}