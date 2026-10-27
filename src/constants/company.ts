/**
 * Legal identification of the company operating Hispora.
 *
 * Single source of truth, consumed by the institutional footer and by the
 * Privacy Policy (where the law requires naming the data controller). Filling
 * the fields below is the only step needed to publish this information in
 * every place at once.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Company identification: FILLED (22/10/2026). CNPJ check digits verified.
 * Still pending: the DPO fields (see `dpoName`/`dpoEmail` below).
 *
 * Any field left empty renders NOTHING in its consumers, rather than an
 * empty label. That is deliberate and must be preserved: publishing a
 * placeholder CNPJ would be a false statement about who controls the data —
 * worse than omitting it, and the same class of problem as the security
 * claims corrected in October 2026 (see
 * archives/docs/legal/features-legal.md, finding A2).
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Why this matters (item 15 of the legal audit):
 *  - Marco Civil da Internet and CDC art. 31 require the operator to be
 *    identifiable to users.
 *  - LGPD: a data subject can only exercise their rights if they know WHO the
 *    controller is. "Hispora Clinical Systems" currently appears only as a
 *    copyright line, with no legal entity behind it.
 *  - Google Play already blocked the app for requiring an organization
 *    account (health category); unidentified company data reinforces that.
 *  - Mercado Pago/Stripe require merchant identification for the recurring
 *    billing that is already live.
 *
 * @see archives/docs/legal/features-legal.md — item 15
 */
export interface CompanyLegalInfo {
  /** Full registered name of the legal entity, e.g. "Hispora Tecnologia Ltda." */
  legalName: string;
  /** Trade name shown to users. Safe to keep even before the CNPJ exists. */
  tradeName: string;
  /** CNPJ, formatted: "00.000.000/0000-00". */
  cnpj: string;
  /** Registered address, single line: street, number, district, city/UF, CEP. */
  address: string;
  /** Contact e-mail for legal/privacy matters.
   *
   * Should move to the @hispora.com.br domain (already configured in Resend).
   * A public-domain address as the sole legal contact channel for a health
   * platform reads as institutionally fragile — see audit item 16. */
  contactEmail: string;
  /**
   * Data Protection Officer ("encarregado"), whose identity and contact LGPD
   * art. 41 requires to be publicly disclosed. Separate from the general
   * support channel on purpose — see audit item 16.1.
   */
  dpoName: string;
  dpoEmail: string;
}

export const COMPANY: CompanyLegalInfo = {
  // "Hispora Clinical Systems" is the trade name ("nome fantasia") the
  // company operates under. Used in both fields because the registered
  // corporate name ("razão social") wasn't supplied separately — if it
  // differs (e.g. "Hispora Tecnologia Ltda."), replace `legalName` with it
  // and keep `tradeName` as is. Both appear in user-facing legal text, so
  // they should match the CNPJ registration.
  legalName: "Hispora Clinical Systems",
  tradeName: "Hispora Clinical Systems",
  cnpj: "69.831.823/0001-65",
  address: "Rua Pais Leme, 215 - Pinheiros, São Paulo/SP - CEP 05424-150",
  contactEmail: "hispora.suporte@yahoo.com",

  // LGPD art. 41: the "encarregado" (DPO) must be publicly identified.
  //
  // `dpoName` is intentionally the company itself rather than a person's
  // name. The ANPD accepts a legal entity or a sector as the appointed
  // encarregado (Guia Orientativo on the role, 2021), and for a company this
  // size that is the sounder choice: naming an individual publishes a
  // personal identity that then has to be kept in sync with staff changes —
  // a stale DPO name is itself a compliance defect.
  //
  // ⚠️ ACTION REQUIRED: `dpoEmail` must be created as a real, monitored
  // mailbox on the hispora.com.br domain (already verified in Resend) before
  // this goes to production. The address is published in the Privacy Policy
  // as the official channel for data-subject requests, so it cannot bounce.
  // If you prefer to appoint a named individual instead, replace `dpoName`.
  dpoName: "Hispora Clinical Systems — Encarregado de Proteção de Dados",
  dpoEmail: "dpo@hispora.com.br",
};

/** True once the company can be legally identified by a user. Lets consumers
 * hide the whole block instead of rendering empty labels. */
export const hasCompanyLegalInfo = Boolean(COMPANY.legalName && COMPANY.cnpj);

/** True once an "encarregado" has been appointed (LGPD art. 41). */
export const hasDpoInfo = Boolean(COMPANY.dpoName && COMPANY.dpoEmail);
