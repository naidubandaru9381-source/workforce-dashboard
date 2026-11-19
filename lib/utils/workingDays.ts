export interface Holiday {
  date: string;
  name: string;
}

export function calculateWorkingDays(
  startDate: string,
  endDate: string,
  holidays: Holiday[] = [],
): number {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  if (start > end) {
    return 0;
  }

  const holidayDates = new Set(holidays.map((holiday) => holiday.date));

  let workingDays = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");

    const dateString = `${year}-${month}-${day}`;

    const isHoliday = holidayDates.has(dateString);

    if (!isWeekend && !isHoliday) {
      workingDays += 1;
    }

    current.setDate(current.getDate() + 1);
  }

  return workingDays;
}