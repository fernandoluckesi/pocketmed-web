// Shared helpers for turning availability rules + exceptions into a bookable
// grid of time slots for a specific calendar day.

export interface Interval {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface DayConfig {
  enabled: boolean;
  intervals: Interval[];
}

export type Weekly = Record<string, DayConfig>;

export interface AvailabilityRule {
  id: string;
  name: string | null;
  weekly: Weekly;
  duration: number;
  buffer: number;
}

export type ExceptionType = "single" | "range";

export interface AvailabilityException {
  id: string;
  type: ExceptionType;
  date: string | null;
  startDate: string | null;
  endDate: string | null;
  fullDay: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
}

// Ordered list of week days (keys match the backend "weekly" object).
export const WEEK_DAYS: { key: string; label: string; short: string }[] = [
  { key: "monday", label: "Segunda-feira", short: "Seg" },
  { key: "tuesday", label: "Terça-feira", short: "Ter" },
  { key: "wednesday", label: "Quarta-feira", short: "Qua" },
  { key: "thursday", label: "Quinta-feira", short: "Qui" },
  { key: "friday", label: "Sexta-feira", short: "Sex" },
  { key: "saturday", label: "Sábado", short: "Sáb" },
  { key: "sunday", label: "Domingo", short: "Dom" },
];

// JS Date.getDay() -> weekly key (0 = Sunday).
const JS_DAY_TO_KEY = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function emptyWeekly(): Weekly {
  const w: Weekly = {};
  for (const d of WEEK_DAYS) {
    w[d.key] = { enabled: false, intervals: [] };
  }
  return w;
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function toHHMM(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Returns the weekly key ("monday", ...) for a "YYYY-MM-DD" date string,
 * parsing it as a local date to avoid timezone drift.
 */
export function weekdayKeyFromDate(dateStr: string): string | null {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return JS_DAY_TO_KEY[date.getDay()];
}

/**
 * Generates the bookable time-slot grid for a set of intervals given the
 * consultation duration and the buffer between consultations.
 */
export function generateSlots(
  intervals: Interval[],
  duration: number,
  buffer: number,
): string[] {
  if (duration < 1) return [];
  const slots: string[] = [];
  const step = duration + Math.max(buffer, 0);
  for (const interval of intervals) {
    const start = toMinutes(interval.start);
    const end = toMinutes(interval.end);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) continue;
    for (let t = start; t + duration <= end; t += step) {
      slots.push(toHHMM(t));
    }
  }
  return slots;
}

/** True when the exception applies to the given "YYYY-MM-DD" date. */
function exceptionMatchesDate(
  exc: AvailabilityException,
  dateStr: string,
): boolean {
  if (exc.type === "single") return exc.date === dateStr;
  if (exc.type === "range" && exc.startDate && exc.endDate) {
    return dateStr >= exc.startDate && dateStr <= exc.endDate;
  }
  return false;
}

export interface DayAvailability {
  /** Whether the doctor is open for booking on the date. */
  open: boolean;
  /** The effective bookable intervals for the date. */
  intervals: Interval[];
  /** Human-friendly reason when the day is closed / customized. */
  reason: string | null;
  /** Whether a specific-date exception overrode the weekly rule. */
  customized: boolean;
}

/**
 * Resolves the effective availability for a single date, applying any
 * specific-date exception on top of the weekly rule.
 *
 * Exception semantics:
 * - fullDay = true  -> the agenda is closed for that date.
 * - fullDay = false -> the startTime/endTime pair *replaces* the weekly
 *   intervals (custom availability window) for that date.
 */
export function resolveDayAvailability(
  dateStr: string,
  weekly: Weekly,
  exceptions: AvailabilityException[],
): DayAvailability {
  const match = exceptions.find((e) => exceptionMatchesDate(e, dateStr));

  if (match) {
    if (match.fullDay) {
      return {
        open: false,
        intervals: [],
        reason: match.reason || "Agenda fechada nesta data.",
        customized: true,
      };
    }
    if (match.startTime && match.endTime) {
      return {
        open: true,
        intervals: [{ start: match.startTime, end: match.endTime }],
        reason: match.reason,
        customized: true,
      };
    }
  }

  const key = weekdayKeyFromDate(dateStr);
  const day = key ? weekly[key] : undefined;
  if (!day || !day.enabled || day.intervals.length === 0) {
    return {
      open: false,
      intervals: [],
      reason: "Sem atendimento neste dia da semana.",
      customized: false,
    };
  }

  return {
    open: true,
    intervals: day.intervals,
    reason: null,
    customized: false,
  };
}
