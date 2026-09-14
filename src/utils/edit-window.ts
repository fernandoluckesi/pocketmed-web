/**
 * Shared rules for editing patient sub-records (diseases, allergies, vaccines,
 * surgeries).
 *
 * A doctor may only edit a record when BOTH conditions are true:
 *  1. Ownership — the record was created by this same doctor (`doctorId` matches
 *     the logged-in user).
 *  2. Time window — the edit happens within the first 3 hours after the record
 *     was created (`createdAt`). After that the record is locked.
 */

/** Editable window, in milliseconds (3 hours). */
export const EDIT_WINDOW_MS = 3 * 60 * 60 * 1000;

export const EDIT_EXPIRED_MESSAGE =
  "O tempo de edição deste registro expirou (limite de 3 horas após a criação).";

export interface EditableRecord {
  doctorId?: string | null;
  createdAt?: string | null;
}

/** True when the logged-in doctor is the creator of the record. */
export function isRecordOwner(
  record: EditableRecord,
  userId: string | undefined,
): boolean {
  return !!userId && !!record.doctorId && record.doctorId === userId;
}

/** True when the record is still inside the 3-hour edit window. */
export function isWithinEditWindow(
  record: EditableRecord,
  now: number = Date.now(),
): boolean {
  if (!record.createdAt) return false;
  const created = new Date(record.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return now - created <= EDIT_WINDOW_MS;
}

/**
 * The doctor may edit only if they own the record AND it is within the window.
 */
export function canEditRecord(
  record: EditableRecord,
  userId: string | undefined,
  now: number = Date.now(),
): boolean {
  return isRecordOwner(record, userId) && isWithinEditWindow(record, now);
}
