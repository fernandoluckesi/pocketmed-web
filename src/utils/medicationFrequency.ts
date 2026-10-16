/**
 * Single source of truth for medication frequency across the web app, kept in
 * sync with the mobile app and the backend `MedicationFrequency` enum.
 *
 * Visible options (doctor-facing): Diário, 2x/3x/4x/5x ao dia, Se necessário.
 * The backend enum still accepts legacy values (every_6/8/12_hours) for old
 * rows, but we no longer offer them in the UI.
 *
 * Canonical values (must match the backend enum exactly):
 *   once_daily | twice_daily | three_times_daily | four_times_daily |
 *   five_times_daily | as_needed
 */

export interface MedicationFrequencyOption {
  value: string;
  label: string;
}

export const MEDICATION_FREQUENCY_OPTIONS: MedicationFrequencyOption[] = [
  { value: "once_daily", label: "Diário" },
  { value: "twice_daily", label: "2x ao dia" },
  { value: "three_times_daily", label: "3x ao dia" },
  { value: "four_times_daily", label: "4x ao dia" },
  { value: "five_times_daily", label: "5x ao dia" },
  { value: "as_needed", label: "Se necessário" },
];

/** All labels, including legacy backend values, for display of existing rows. */
const FREQUENCY_LABELS: Record<string, string> = {
  once_daily: "Diário",
  twice_daily: "2x ao dia",
  three_times_daily: "3x ao dia",
  four_times_daily: "4x ao dia",
  five_times_daily: "5x ao dia",
  every_6_hours: "A cada 6 horas",
  every_8_hours: "A cada 8 horas",
  every_12_hours: "A cada 12 horas",
  as_needed: "Se necessário",
};

export function getMedicationFrequencyLabel(value: string): string {
  return FREQUENCY_LABELS[value] || value;
}

/** How many daily dose times a given frequency implies (0 = no fixed times). */
export function getMedicationTimeSlots(frequency: string): number {
  switch (frequency) {
    case "once_daily":
      return 1;
    case "twice_daily":
      return 2;
    case "three_times_daily":
      return 3;
    case "four_times_daily":
      return 4;
    case "five_times_daily":
      return 5;
    case "every_6_hours":
      return 4;
    case "every_8_hours":
      return 3;
    case "every_12_hours":
      return 2;
    case "as_needed":
      return 0;
    default:
      return 1;
  }
}

/** Default even distribution of `count` dose times across the day. */
export function generateDistributedTimes(count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return ["08:00"];
  if (count === 2) return ["08:00", "20:00"];
  if (count === 3) return ["08:00", "14:00", "20:00"];
  if (count === 4) return ["08:00", "12:00", "16:00", "20:00"];
  if (count === 5) return ["08:00", "12:00", "16:00", "20:00", "00:00"];
  // Fallback: spread evenly starting at 08:00.
  const start = 8;
  const interval = Math.floor(14 / (count - 1));
  return Array.from({ length: count }, (_, i) => {
    const hour = (start + i * interval) % 24;
    return `${hour.toString().padStart(2, "0")}:00`;
  });
}

/** Even interval (in minutes) between doses for a fixed-count frequency. */
function doseIntervalMinutes(frequency: string): number {
  switch (frequency) {
    case "twice_daily":
    case "every_12_hours":
      return 12 * 60;
    case "three_times_daily":
    case "every_8_hours":
      return 8 * 60;
    case "four_times_daily":
    case "every_6_hours":
      return 6 * 60;
    case "five_times_daily":
      // 5 doses across the day → ~4h apart (08:00, 12:00, 16:00, 20:00, 00:00).
      return 4 * 60;
    default:
      return 0;
  }
}

/**
 * Recalculates every dose time from the FIRST one, keeping the even interval
 * implied by the frequency. Mirrors the mobile behavior: when the doctor edits
 * the first time, the following times shift accordingly. Only the first time
 * drives the recalculation; other frequencies (once/as_needed) are untouched.
 */
export function recalcTimesFromFirst(
  frequency: string,
  times: string[],
  editedIndex: number,
  newValue: string,
): string[] {
  const updated = [...times];
  updated[editedIndex] = newValue;

  if (editedIndex !== 0) return updated;

  const interval = doseIntervalMinutes(frequency);
  if (interval <= 0 || updated.length <= 1) return updated;

  const [h, m] = newValue.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return updated;

  const baseMinutes = h * 60 + m;
  return updated.map((_, i) => {
    const total = (baseMinutes + interval * i) % (24 * 60);
    const hh = Math.floor(total / 60);
    const mm = total % 60;
    return `${hh.toString().padStart(2, "0")}:${mm
      .toString()
      .padStart(2, "0")}`;
  });
}
