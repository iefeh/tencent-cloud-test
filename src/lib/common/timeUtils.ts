import moment from "moment";
import { RepeatPeriod } from "../quests/types";
import { format } from "date-fns";

export function getWeekNumber(date: Date): number {
  const tempDate = date;
  const dayNum = (date.getDay() + 6) % 7;
  tempDate.setDate(tempDate.getDate() - dayNum + 3);
  const firstThursday = tempDate.valueOf();
  tempDate.setMonth(0, 1);
  if (tempDate.getDay() !== 4) {
    tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - tempDate.valueOf()) / (7 * 24 * 60 * 60 * 1000));
}

export function getFirstDayOfNextWeek(date: Date): number {
  const currentDay = date.getDay();
  const dayDelta = 8 - currentDay;
  let firstDayOfNextWeek = new Date(date.getTime() + dayDelta * 24 * 60 * 60 * 1000);
  return firstDayOfNextWeek.setHours(0, 0, 0, 0);
}

export function getFirstDayOfNextMonth(date: Date): number {
  const currentMonth = date.getMonth();
  let firstDayOfNextMonth = new Date(date.getTime());
  firstDayOfNextMonth.setMonth(currentMonth === 11 ? 0 : currentMonth + 1, 1);
  if (currentMonth === 11) {
    let nextYear = date.getFullYear() + 1;
    firstDayOfNextMonth.setFullYear(nextYear);
  }
  return firstDayOfNextMonth.setHours(0, 0, 0, 0);
}

export function getISOYearWeekString(date: Date): string {
  const year = date.getUTCFullYear();
  const weekNumber = getWeekNumber(date);
  return `${year}-w${weekNumber}`;
}

export function getISOMonthDayTimeString(date: Date): string {
  const now = moment(date);
  return now.format("YYYY-MM");
}

export function getISOFullDateTimeString(date: Date): string {
  const now = moment(date);
  return now.format("YYYY-MM-DD");
}

export function getRepeatPeriodIdentifier(period: RepeatPeriod) {
  switch (period) {
    case RepeatPeriod.Daily:
      return format(Date.now(), 'yyyy-MM-dd');
    case RepeatPeriod.Weekly:
      return format(Date.now(), 'yyyy-ww');
    case RepeatPeriod.Monthly:
      return format(Date.now(), 'yyyy-MM');
    default:
      return undefined;
  }
}