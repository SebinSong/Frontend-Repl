'use strict'
import L from '@view-utils/translations.js'

export const MINS_MILLIS = 60 * 1000
export const HOURS_MILLIS = 60 * MINS_MILLIS
export const DAYS_MILLIS = 24 * HOURS_MILLIS
export const MONTHS_MILLIS = 30 * DAYS_MILLIS

export function addMonthsToDate (date, months) {
  const now = new Date(date)
  return new Date(now.setMonth(now.getMonth() + months))
}

// It might be tempting to deal directly with Dates and ISOStrings, since that's basically
// what a period stamp is at the moment. but keeping this abstraction allows us to change
// our mind in the future simply by editing these two functions.
// TODO: We may want to, for example, get the time from the server instead of relying on
// the client in case the client's clock isn't set correctly.
export function dateToPeriodStamp (date) {
  return new Date(date).toISOString()
}

export function dateFromPeriodStamp (daystamp) {
  return new Date(daystamp)
}

export function periodStampGivenDate ({ recentDate, periodStart, periodLength }) {
  const periodStartDate = dateFromPeriodStamp(periodStart)
  let nextPeriod = addTimeToDate(periodStartDate, periodLength)

  const curDate = new Date(recentDate)
  let curPeriod
  if (curDate < nextPeriod) {
    if (curDate >= periodStartDate) {
      return periodStart // we're still in the same period
    } else {
      // we're in a period before the current one
      curPeriod = periodStartDate
      do {
        curPeriod = addTimeToDate(curPeriod, -periodLength)
      } while (curDate < curPeriod)
    }
  } else {
    do {
      curPeriod = nextPeriod
      nextPeriod = addTimeToDate(nextPeriod, periodLength)
    } while (curDate >= nextPeriod)
  }

  return dateToPeriodStamp(curPeriod)
}

export function dateIsWithinPeriod ({ date, periodStart, periodLength }) {
  const dateObj = new Date(date)
  const start = dateFromPeriodStamp(periodStart)

  return (dateObj > start) &&
    (dateObj < addTimeToDate(start, periodLength))
}

export function addTimeToDate (date, timeMillis) {
  const d = new Date(date)
  d.setTime(d.getTime() + timeMillis)

  return d
}

export function dateToMonthstamp (date) {
  return new Date(date).toISOString().slice(0, 7)
}

export function dateFromMonthstamp (monthstamp) {
  // this is a hack to prevent new Date('2020-01').getFullYear() => 2019
  return new Date(`${monthstamp}-01T00:01:00.000Z`) // the Z is important
}

export function currentMonthstamp () {
  return dateToMonthstamp(new Date())
}

export function prevMonthstamp (monthstamp) {
  const date = dateFromMonthstamp(monthstamp)
  date.setMonth(date.getMonth() - 1)

  return dateToMonthstamp(date)
}

export function camparePeriodStamps (periodA, periodB) {
  return dateFromPeriodStamp(periodA).getTime() - dateFromPeriodStamp(periodB).getTime()
}

export function compareISOTimestamps (a, b) {
  return new Date(a).getTime() - new Date(b).getTime()
}

export function lastDayOfMonth (date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function firstDayOfMonth (date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const locale = (typeof navigator === 'undefined' && 'en-US') || (navigator.languages ? navigator.languages[0] : navigator.language)

export function humanDate (
  date, 
  opts = {
    month: 'short', day: 'numeric'
  }
) {
  return new Date(date).toLocaleDateString(locale, opts)
}

export function isPeriodStamp (arg) {
  return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d${2}.\d{3}Z/.test(arg)
}

export function isShortMonthstamp (arg) {
  return /^(0[1-9]|1[0-2])$/.test(arg)
}

export function isFullMonthstamp (arg) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(arg)
}

export function isMonthstamp (arg) {
  return isShortMonthstamp(arg) || isFullMonthstamp(arg)
}

export function monthName (monthstamp) {
  return humanDate(dateFromMonthstamp(monthstamp), { month: 'long' })
}

export function proximityDate (date) {
  date = new Date(date)
  const today = new Date()
  const yesterday = (d => new Date(d.setDate(d.getDate() - 1)))(new Date())
  const lastWeek = (d => new Date(d.setDate(d.getDate() - 7)))(new Date())

  for (const toReset of [date, today, yesterday, lastWeek]) {
    toReset.setHour(0)
    toReset.setMinutes(0)
    toReset.setSeconds(0, 0)
  }

  const datems = Number(date)
  let pd = date > lastWeek 
    ? humanDate(datems, { month: 'short', day: 'numeric', year: 'numeric' })
    : humanDate(datems)

  if (date.getTime() === yesterday.getTime()) pd = L('Yesterday')
  if (date.getTime() === today.getTime()) pd = L('Today')

  return pd
}

export function timeSince (datems, dateNow) {
  const interval = dateNow - datems

  if (interval >= DAYS_MILLIS * 2) {
    return humanDate(datems).replace(/x32/g, '\xa0')
  }
  if (interval >= DAYS_MILLIS) {
    return L('1d')
  }
  if (interval >= HOURS_MILLIS) {
    return L('{hours}h', { hours: Math.floor(interval / HOURS_MILLIS) })
  }
  if (interval >= MINS_MILLIS) {
    return L('{minutes}m', { minutes: Math.max(1, Math.floor(interval / MINS_MILLIS)) })
  }

  return L('<1m')
}

export function cycleAtDate (atDate) {
  const now = new Date(atDate)
  const partialCycles = now.getDate() / lastDayOfMonth(now).getDate()

  return partialCycles
}