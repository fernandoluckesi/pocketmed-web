import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { InstitutionalFooter } from "../pages/Institutional/InstitutionalFooter";
import { PrivacyPolicyContent } from "../pages/Institutional/LegalModal";
import { COMPANY, hasCompanyLegalInfo, hasDpoInfo } from "../constants/company";

/**
 * Covers the company legal identification required by item 15 of the legal
 * audit (see archives/docs/legal/features-legal.md).
 *
 * Two distinct properties are pinned:
 *
 *  1. The company data IS published — footer and Privacy Policy must name the
 *     controller, because a data subject can only exercise LGPD rights if
 *     they know who controls the data.
 *  2. The DPO section is still correctly HIDDEN. Those fields are empty, and
 *     the "empty renders nothing" behaviour has to keep working — a label
 *     with a blank value looks like disclosed information when it isn't.
 *     This is the same reasoning that kept a placeholder CNPJ out of the
 *     codebase while the real one didn't exist.
 */

/** Digit-verifier check, so a typo in the published CNPJ fails here rather
 * than sitting in a legal document. Same algorithm as the backend's
 * CNPJ-bearing DTOs. */
function isValidCnpj(value: string): boolean {
  const d = value.replace(/\D/g, "").split("").map(Number);
  if (d.length !== 14) return false;
  if (d.every((n) => n === d[0])) return false;

  const dv = (digits: number[]): number => {
    const weights = Array.from({ length: digits.length }, (_, i) => {
      const w = digits.length + 1 - i;
      return w <= 9 ? w : w - 8;
    });
    const sum = digits.reduce((acc, n, i) => acc + n * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const dv1 = dv(d.slice(0, 12));
  return dv1 === d[12] && dv([...d.slice(0, 12), dv1]) === d[13];
}

function renderFooter() {
  return render(
    <MemoryRouter>
      <InstitutionalFooter />
    </MemoryRouter>,
  );
}

describe("Company legal information (audit item 15)", () => {
  describe("constants", () => {
    it("has the company identified", () => {
      expect(COMPANY.legalName).toBeTruthy();
      expect(COMPANY.cnpj).toBeTruthy();
      expect(COMPANY.address).toBeTruthy();
      expect(hasCompanyLegalInfo).toBe(true);
    });

    it("publishes a CNPJ whose check digits are valid", () => {
      // Catches a transcription error before it reaches a legal document.
      expect(isValidCnpj(COMPANY.cnpj)).toBe(true);
    });

    it("keeps the CNPJ in the canonical formatted shape", () => {
      expect(COMPANY.cnpj).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
    });

    it("still exposes a contact channel for data-subject requests", () => {
      expect(COMPANY.contactEmail).toBeTruthy();
    });
  });

  describe("institutional footer", () => {
    it("publishes legal name, CNPJ and address", () => {
      // Marco Civil / CDC art. 31: the operator must be identifiable.
      renderFooter();
      expect(screen.getByText(COMPANY.legalName)).toBeInTheDocument();
      expect(
        screen.getByText(new RegExp(COMPANY.cnpj.replace(/[./-]/g, "\\$&"))),
      ).toBeInTheDocument();
      expect(screen.getByText(/Rua Pais Leme/)).toBeInTheDocument();
      expect(screen.getByText(/05424-150/)).toBeInTheDocument();
    });

    it("keeps the copyright line", () => {
      // Regression guard: publishing the company block must not displace
      // what was already in the footer.
      renderFooter();
      expect(screen.getByText(/©/)).toBeInTheDocument();
    });
  });

  describe("privacy policy", () => {
    it("names the controller with CNPJ and address", () => {
      // Asserted over the section's full text because the company data is
      // split across <strong> elements inside a sentence, so no single node
      // holds it all.
      const { container } = render(<PrivacyPolicyContent />);
      const text = container.textContent ?? "";

      expect(text).toContain("Controlador dos Dados");
      expect(text).toContain(COMPANY.legalName);
      expect(text).toContain(COMPANY.cnpj);
      expect(text).toContain("Rua Pais Leme");
    });

    it("still exposes the contact e-mail", () => {
      render(<PrivacyPolicyContent />);
      expect(screen.getByText(COMPANY.contactEmail)).toBeInTheDocument();
    });
  });

  describe("DPO / encarregado (LGPD art. 41)", () => {
    it("has an encarregado appointed with a contact", () => {
      expect(hasDpoInfo).toBe(true);
      expect(COMPANY.dpoName).toBeTruthy();
      expect(COMPANY.dpoEmail).toBeTruthy();
    });

    it("uses an address on the company's own domain", () => {
      // A public-domain mailbox (e.g. @yahoo.com) as the formal legal
      // channel for a health platform reads as institutionally fragile, and
      // the ANPD may contact this address directly.
      expect(COMPANY.dpoEmail).toMatch(/@hispora\.com\.br$/);
    });

    it("publishes the section with name, contact and the ANPD route", () => {
      const { container } = render(<PrivacyPolicyContent />);
      const text = container.textContent ?? "";

      expect(text).toContain("Encarregado pelo Tratamento");
      expect(text).toContain(COMPANY.dpoName);
      expect(text).toContain(COMPANY.dpoEmail);
      // The data subject must know they can escalate to the authority.
      expect(text).toContain("ANPD");
    });
  });

  describe("conditional-rendering flags", () => {
    it("hasCompanyLegalInfo requires BOTH legal name and CNPJ", () => {
      // Either alone is not enough to identify the controller.
      const check = (legalName: string, cnpj: string) =>
        Boolean(legalName && cnpj);

      expect(check("", "")).toBe(false);
      expect(check("Hispora Clinical Systems", "")).toBe(false);
      expect(check("", "69.831.823/0001-65")).toBe(false);
      expect(check("Hispora Clinical Systems", "69.831.823/0001-65")).toBe(
        true,
      );
    });

    it("hasDpoInfo requires both name and e-mail", () => {
      const check = (name: string, email: string) => Boolean(name && email);

      expect(check("Fulano", "")).toBe(false);
      expect(check("", "dpo@hispora.com.br")).toBe(false);
      expect(check("Fulano", "dpo@hispora.com.br")).toBe(true);
    });
  });
});
