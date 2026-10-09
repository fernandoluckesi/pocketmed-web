/**
 * Formats a DATE-only backend value (TypeORM `date` column, not
 * `datetime`/`timestamp`) for display, without timezone-shifting it.
 *
 * Such a column serializes over the API as a bare "YYYY-MM-DD" string. Doing
 * `new Date("YYYY-MM-DD").toLocaleDateString()` parses that string as UTC
 * midnight, so in any timezone behind UTC (e.g. BRT, UTC-3) it renders as the
 * previous day — there is no "moment in time" to convert here, just a
 * calendar date that should be shown exactly as stored.
 */
export function formatDateOnly(
  value: string | Date | null | undefined,
): string {
  if (!value) return "";
  const str = value instanceof Date ? value.toISOString() : value;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
