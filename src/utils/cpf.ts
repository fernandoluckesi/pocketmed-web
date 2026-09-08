/**
 * Shared CPF helpers for the web app: masking, normalization and full
 * validation (check digits). The backend performs the authoritative
 * validation; these run on the client for UX (mask + inline errors).
 */

/** Returns only the digits of a CPF string. */
export function normalizeCpf(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

/** Applies the 000.000.000-00 mask progressively as the user types. */
export function maskCpf(value: string): string {
  const digits = normalizeCpf(value).slice(0, 11);
  let masked = digits;
  if (digits.length > 3) masked = digits.slice(0, 3) + "." + digits.slice(3);
  if (digits.length > 6)
    masked = masked.slice(0, 7) + "." + digits.slice(6);
  if (digits.length > 9)
    masked = masked.slice(0, 11) + "-" + digits.slice(9);
  return masked;
}

/**
 * Validates a CPF by its check digits. Accepts masked or unmasked input.
 * Rejects wrong length, all-equal digits, and mismatched check digits.
 */
export function isValidCpf(value: string | null | undefined): boolean {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map((d) => parseInt(d, 10));

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += digits[i] * (10 - i);
  let firstCheck = (sum * 10) % 11;
  if (firstCheck === 10) firstCheck = 0;
  if (firstCheck !== digits[9]) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += digits[i] * (11 - i);
  let secondCheck = (sum * 10) % 11;
  if (secondCheck === 10) secondCheck = 0;
  if (secondCheck !== digits[10]) return false;

  return true;
}
