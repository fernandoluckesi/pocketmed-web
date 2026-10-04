/**
 * Brazil's 27 federative units. Shared so the CRM's UF select is populated
 * from one list — it previously lived inline in Signup only, which left the
 * Account screen with a free-text CRM field and no UF validation at all.
 * Mirrors `BRAZILIAN_UFS` in the backend's `common/crm.util.ts`.
 */
export const UF_LIST = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export type Uf = (typeof UF_LIST)[number];

export function isValidUf(value?: string | null): boolean {
  if (!value) return false;
  return (UF_LIST as readonly string[]).includes(value.trim().toUpperCase());
}
