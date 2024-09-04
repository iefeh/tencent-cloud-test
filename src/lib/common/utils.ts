import moment from "moment";

export function getWeekNumber(date: Date): number {
  const tempDate = date;
  const dayNum = (date.getDay() + 6) % 7;
  tempDate.setDate(tempDate.getDate() - dayNum + 3);
  const firstThursday = tempDate.valueOf();
  tempDate.setMonth(0, 1);
  if (tempDate.getDay() !== 4) {
      tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000);
}

export function getISOYearWeekString(date: Date): string {
  const year = date.getUTCFullYear();
  const weekNumber = getWeekNumber(date);
  return `${year}-w${weekNumber}`;
}

export function getISOMonthDayTime(date: Date) {
  const now = moment(date);
  return now.format("YYYY-MM");
}

export function getISOFullDateTime(date: Date) {
  const now = moment(date);
  return now.format("YYYY-MM-DD");
}