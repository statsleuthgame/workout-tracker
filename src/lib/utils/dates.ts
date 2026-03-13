const PROGRAM_START = "2026-03-08"; // Sunday, Week 1

export function getWeekNumber(date: Date = new Date()): number {
  const start = new Date(PROGRAM_START + "T12:00:00");
  const diff = date.getTime() - start.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  const week = Math.floor(daysDiff / 7) + 1;
  return Math.max(1, Math.min(5, week));
}

export function getDayOfWeek(date: Date = new Date()): number {
  return date.getDay(); // 0=Sun ... 6=Sat
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
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

export function getDateForDayInWeek(weekNumber: number, dayOfWeek: number): Date {
  const start = new Date(PROGRAM_START + "T12:00:00");
  const dayOffset = (weekNumber - 1) * 7 + dayOfWeek;
  const date = new Date(start);
  date.setDate(start.getDate() + dayOffset);
  return date;
}
