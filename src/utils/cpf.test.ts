import { describe, it, expect } from "vitest";
import { isValidCpf, maskCpf, normalizeCpf } from "./cpf";

describe("cpf utils", () => {
  const VALID_UNMASKED = "39053344705";
  const VALID_MASKED = "390.533.447-05";

  describe("normalizeCpf", () => {
    it("strips mask and non-digits", () => {
      expect(normalizeCpf("390.533.447-05")).toBe("39053344705");
    });
    it("handles empty/null/undefined", () => {
      expect(normalizeCpf("")).toBe("");
      expect(normalizeCpf(null)).toBe("");
      expect(normalizeCpf(undefined)).toBe("");
    });
  });

  describe("maskCpf", () => {
    it("masks progressively", () => {
      expect(maskCpf("390")).toBe("390");
      expect(maskCpf("3905")).toBe("390.5");
      expect(maskCpf("39053344705")).toBe("390.533.447-05");
    });
    it("caps at 11 digits", () => {
      expect(maskCpf("390533447050000")).toBe("390.533.447-05");
    });
  });

  describe("isValidCpf", () => {
    it("accepts a valid CPF (masked and unmasked)", () => {
      expect(isValidCpf(VALID_UNMASKED)).toBe(true);
      expect(isValidCpf(VALID_MASKED)).toBe(true);
      expect(isValidCpf("11144477735")).toBe(true);
    });
    it("rejects wrong check digits", () => {
      expect(isValidCpf("39053344700")).toBe(false);
      expect(isValidCpf("12345678900")).toBe(false);
    });
    it("rejects wrong length", () => {
      expect(isValidCpf("123")).toBe(false);
    });
    it("rejects repeated digits", () => {
      expect(isValidCpf("00000000000")).toBe(false);
      expect(isValidCpf("11111111111")).toBe(false);
    });
    it("rejects empty/null/undefined", () => {
      expect(isValidCpf("")).toBe(false);
      expect(isValidCpf(null)).toBe(false);
      expect(isValidCpf(undefined)).toBe(false);
    });
  });
});
