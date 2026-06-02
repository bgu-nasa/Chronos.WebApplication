/**
 * Period-relative week index (1..N), Sunday-start weeks — matches engine PeriodWeekCalculator.
 */
export function getSundayWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function getPeriodWeekIndex(periodFromDate: string | Date, date: Date): number {
  const periodFrom =
    typeof periodFromDate === 'string' ? new Date(periodFromDate) : periodFromDate;
  const periodStartSunday = getSundayWeekStart(periodFrom);
  const weekStart = getSundayWeekStart(date);
  if (weekStart.getTime() < periodStartSunday.getTime()) {
    return 1;
  }
  const days = Math.floor(
    (weekStart.getTime() - periodStartSunday.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.floor(days / 7) + 1;
}
