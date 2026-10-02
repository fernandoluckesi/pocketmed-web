/**
 * Role helpers for professional accounts.
 *
 * Professional users all share `type: "doctor"` and are differentiated by
 * `role` ("doctor" | "admin" | "secretary"). Checking `type` alone treats a
 * secretary as a physician, which is why these helpers exist — the same
 * `user?.role === "secretary"` comparison was being repeated per screen.
 */

interface RoleBearer {
  type?: string;
  role?: string;
}

/** Clinic staff with no clinical duties: schedules, never writes clinical data. */
export function isSecretary(user: RoleBearer | null | undefined): boolean {
  return user?.type === "doctor" && user?.role === "secretary";
}

/**
 * Can author clinical content (diagnosis, prescriptions, exam requests).
 * Admins are physicians who also manage the clinic, so they qualify;
 * secretaries never do.
 */
export function canWriteClinicalData(
  user: RoleBearer | null | undefined,
): boolean {
  return (
    user?.type === "doctor" &&
    (user?.role === "doctor" || user?.role === "admin")
  );
}
