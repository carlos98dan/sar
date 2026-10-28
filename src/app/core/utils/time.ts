/** Minutos desde medianoche de la hora de un ISO 8601 (por ejemplo `2026-10-24T08:30:00-05:00` → 510). */
export function isoTimeToMinutes(isoDateTime: string): number {
  return timeToMinutes(isoDateTime.slice(11, 16));
}

/** Minutos desde medianoche de una hora `HH:mm`. */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Fecha local en formato `YYYY-MM-DD`. */
export function toDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}
