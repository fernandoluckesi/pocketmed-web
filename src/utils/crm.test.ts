import { describe, it, expect } from "vitest";
import { formatCrm, parseCrm, resolveCrm } from "./crm";

/**
 * The structured fields (`crmNumber`/`crmUf`) are the source of truth; the
 * combined string is legacy. These tests pin down that precedence, and that
 * the fallback parser still reads the shapes that predate the split.
 */
describe("crm utils", () => {
  describe("resolveCrm", () => {
    it("prefers the structured fields", () => {
      expect(
        resolveCrm({ crm: "999999/RJ", crmNumber: "123456", crmUf: "SP" }),
      ).toEqual({ number: "123456", uf: "SP" });
    });

    it("uppercases the UF coming from the structured fields", () => {
      expect(resolveCrm({ crmNumber: "123456", crmUf: "sp" })).toEqual({
        number: "123456",
        uf: "SP",
      });
    });

    it("falls back to parsing the legacy string when the fields are empty", () => {
      expect(resolveCrm({ crm: "123456/SP" })).toEqual({
        number: "123456",
        uf: "SP",
      });
    });

    it("handles null/undefined", () => {
      expect(resolveCrm(null)).toEqual({ number: "", uf: "" });
      expect(resolveCrm(undefined)).toEqual({ number: "", uf: "" });
    });
  });

  describe("parseCrm", () => {
    it("reads the legacy shapes that exist in older records", () => {
      expect(parseCrm("123456/SP")).toEqual({ number: "123456", uf: "SP" });
      expect(parseCrm("SP-123456")).toEqual({ number: "123456", uf: "SP" });
      expect(parseCrm("CRM-SP-00001")).toEqual({ number: "00001", uf: "SP" });
    });

    it("does not read a UF out of a longer word", () => {
      // "SEC00001" must not yield "SE" (Sergipe) — these are synthetic
      // secretary CRMs with no UF at all.
      expect(parseCrm("SEC00001")).toEqual({ number: "00001", uf: "" });
    });

    it("returns empties for blank input", () => {
      expect(parseCrm("")).toEqual({ number: "", uf: "" });
      expect(parseCrm(null)).toEqual({ number: "", uf: "" });
    });
  });

  describe("formatCrm", () => {
    it("formats from the structured fields", () => {
      expect(formatCrm({ crmNumber: "123456", crmUf: "SP" })).toBe("123456/SP");
    });

    it("formats from a legacy string", () => {
      expect(formatCrm("SP-123456")).toBe("123456/SP");
    });

    it("omits the UF when there is none", () => {
      expect(formatCrm({ crmNumber: "123456", crmUf: null })).toBe("123456");
    });

    it("returns an empty string when there is no CRM", () => {
      expect(formatCrm(null)).toBe("");
      expect(formatCrm({})).toBe("");
    });
  });
});
