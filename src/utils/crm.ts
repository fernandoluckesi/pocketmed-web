/**
 * CRM is stored as a single string, in either "SP-100001" or "100001/SP"
 * form depending on where the account was created. These helpers read the
 * number and the UF out of it so screens can present "CRM" and "UF do CRM"
 * as separate fields without the backend needing a second column.
 */

export interface ParsedCrm {
  number: string;
  uf: string;
}

export function parseCrm(crm?: string | null): ParsedCrm {
  if (!crm) return { number: "", uf: "" };

  const dashMatch = crm.match(/^([A-Za-z]{2})-(\d+)$/);
  if (dashMatch) {
    return { number: dashMatch[2], uf: dashMatch[1].toUpperCase() };
  }

  const slashMatch = crm.match(/^(\d+)\s*\/\s*([A-Za-z]{2})$/);
  if (slashMatch) {
    return { number: slashMatch[1], uf: slashMatch[2].toUpperCase() };
  }

  return { number: crm, uf: "" };
}

/** Normalized "numero/UF" display form. */
export function formatCrm(crm?: string | null): string {
  const { number, uf } = parseCrm(crm);
  if (!number) return "";
  return uf ? `${number}/${uf}` : number;
}
