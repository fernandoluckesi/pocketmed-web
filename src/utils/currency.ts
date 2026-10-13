/**
 * BRL currency mask helpers. Treats the digits typed as cents and formats
 * progressively — e.g. typing "1234" renders "R$ 12,34" — the same mental
 * model as the CPF mask in `cpf.ts`.
 */

/** Applies the "R$ 0,00" mask as the user types (digits-as-cents). */
export function maskCurrencyBRL(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const reais = parseInt(digits, 10) / 100;
  return reais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Extracts the raw decimal number (e.g. 12.34) from a masked BRL string. */
export function parseCurrencyBRL(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  return parseInt(digits, 10) / 100;
}
