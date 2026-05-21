const DEFAULT_TZ = process.env.ATTENDANCE_TIMEZONE ?? "Europe/Bucharest";

// Returns a Date at UTC midnight representing "today" in the given timezone.
// This ensures the @@unique([workerId, workPointId, date]) constraint works
// correctly regardless of server UTC offset.
export function todayInZone(tz: string = DEFAULT_TZ): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;

  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}
