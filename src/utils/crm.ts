/**
 * CRM display helpers.
 *
 * The backend now stores the registration number and the issuing UF in their
 * own columns (`crmNumber` / `crmUf`) — that pair is the source of truth.
 * The legacy `crm` string is still returned, in canonical "number/UF" form,
 * for older clients.
 *
 * `parseCrm` is kept as a *fallback* for records that predate the split (or
 * synthetic CRMs that never had a UF). Prefer `resolveCrm`, which uses the
 * structured fields when present and only parses when it has to.
 */

export interface ParsedCrm {
  number: string;
  uf: string;
}

/** Anything carrying CRM data from the API. */
export interface CrmBearer {
  crm?: string | null;
  crmNumber?: string | null;
  crmUf?: string | null;
}

/**
 * Last-resort parser for a combined CRM string. Handles the shapes that
 * existed before the columns were split: "123456/SP", "SP-123456",
 * "CRM-SP-00001".
 */
export function parseCrm(crm?: string | null): ParsedCrm {
  if (!crm) return { number: "", uf: "" };

  const value = String(crm).trim();
  if (!value) return { number: "", uf: "" };

  // Only whole 2-letter runs count as a UF, so "SEC00001" doesn't yield
  // "SE" (Sergipe) from inside the word.
  const letterRuns = value.toUpperCase().match(/[A-Z]+/g) ?? [];
  const uf = letterRuns.find((run) => run.length === 2) ?? "";

  const digitRuns = value.match(/\d+/g) ?? [];
  let number = "";
  for (const run of digitRuns) {
    if (run.length > number.length) number = run;
  }

  return { number: number || value, uf };
}

/**
 * Reads the CRM as number + UF, preferring the structured fields the backend
 * now provides and falling back to parsing the legacy string.
 */
export function resolveCrm(source?: CrmBearer | null): ParsedCrm {
  if (!source) return { number: "", uf: "" };

  const number = String(source.crmNumber || "").trim();
  const uf = String(source.crmUf || "")
    .trim()
    .toUpperCase();

  if (number) return { number, uf };

  return parseCrm(source.crm);
}

/** Canonical display form: "123456/SP" (or just the number when no UF). */
export function formatCrm(source?: CrmBearer | string | null): string {
  const parsed =
    typeof source === "string" || source == null
      ? parseCrm(source)
      : resolveCrm(source);

  if (!parsed.number) return "";
  return parsed.uf ? `${parsed.number}/${parsed.uf}` : parsed.number;
}
