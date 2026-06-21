// Evergreen weekly routine — workouts repeat every week, keyed by day-of-week.

export function getDayOfWeek(date: Date = new Date()): number {
  return date.getDay(); // 0=Sun ... 6=Sat
}

// Local YYYY-MM-DD. Uses local calendar fields (not toISOString) so an evening
// workout logs against the correct local day instead of rolling over to UTC.
export function getDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateString(dateStr: string): Date {
  // Anchor at noon to avoid DST/UTC edge cases shifting the day.
  return new Date(dateStr + "T12:00:00");
}

export function formatDate(dateStr: string): string {
  return parseDateString(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek];
}

export function getDayAbbrev(dayOfWeek: number): string {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return days[dayOfWeek];
}

// The 7 dates (Sun..Sat) for the calendar week containing today + weekOffset weeks.
export function getWeekDates(weekOffset = 0): Date[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

export function formatWeekRange(dates: Date[]): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${dates[0].toLocaleDateString("en-US", opts)} – ${dates[6].toLocaleDateString("en-US", opts)}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}
