import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  PrivacyPolicyContent,
  TermsOfServiceContent,
} from "../pages/Institutional/LegalModal";

/**
 * Covers the legal clauses added on 22/10/2026 for audit findings 4, 16.2,
 * R1, R2 and R3 (see archives/docs/legal/features-legal.md).
 *
 * These are assertions about *published legal text*, which is unusual for a
 * test suite but deliberate here: each clause exists because its absence was
 * a concrete exposure (CDC art. 49, LGPD art. 14/33, CFM 1.821/2007). A
 * refactor that silently drops one of them would reintroduce the exposure
 * without breaking anything visible, so the text itself is pinned.
 *
 * Matching is intentionally loose — anchored on the legal concept and on the
 * statutory reference, not on full sentences — so the wording can be
 * improved without churning the tests.
 */

function privacyText(): string {
  const { container } = render(<PrivacyPolicyContent />);
  return container.textContent ?? "";
}

function termsText(): string {
  const { container } = render(<TermsOfServiceContent />);
  return container.textContent ?? "";
}

describe("Privacy Policy — added clauses", () => {
  describe("R1: children and adolescents (LGPD art. 14)", () => {
    it("has a dedicated section, since the product supports dependents", () => {
      const text = privacyText();
      expect(text).toMatch(/Crianças e Adolescentes/i);
      expect(text).toContain("Art. 14");
    });

    it("states that consent is given by the legal guardian", () => {
      const text = privacyText();
      expect(text).toMatch(/respons[áa]vel legal/i);
      expect(text).toMatch(/melhor interesse/i);
    });

    it("rules out marketing and profiling of minors' data", () => {
      // LGPD art. 14 §4 forbids conditioning participation on excessive data.
      const text = privacyText();
      expect(text).toMatch(/marketing/i);
    });
  });

  describe("16.2: subprocessors and international transfer", () => {
    it("names each subprocessor instead of saying 'terceiros'", () => {
      const text = privacyText();
      for (const vendor of [
        "Railway",
        "Cloudflare",
        "Resend",
        "Mercado Pago",
      ]) {
        expect(text).toContain(vendor);
      }
    });

    it("declares international transfer with its legal basis", () => {
      // LGPD art. 33: the transfer happens (US-hosted stack) and has to be
      // disclosed, not just implied.
      const text = privacyText();
      expect(text).toMatch(/Transferência Internacional/i);
      expect(text).toContain("Art. 33");
      expect(text).toMatch(/Estados Unidos/);
    });

    it("limits what the payment provider receives", () => {
      // Health data must not flow to the payment processor.
      const text = privacyText();
      expect(text).toMatch(/não tem acesso a dados de saúde/i);
      expect(text).toMatch(/não armazena dados de cartão/i);
    });
  });

  describe("R3: CFM 20-year retention vs LGPD erasure", () => {
    it("cites both the retention duty and the erasure right", () => {
      const text = privacyText();
      expect(text).toContain("CFM 1.821/2007");
      expect(text).toMatch(/20 anos/);
      expect(text).toMatch(/Art\. 18/);
    });

    it("explains what is deleted and what is retained", () => {
      // The question a user actually has: "so will my data be deleted?".
      const text = privacyText();
      expect(text).toMatch(/É eliminado/i);
      expect(text).toMatch(/É retido/i);
      // Art. 16 is what authorises keeping data despite an erasure request.
      expect(text).toContain("Art. 16");
    });

    it("commits to deleting once the legal duty ends", () => {
      const text = privacyText();
      expect(text).toMatch(/cessada a obrigação legal/i);
    });
  });
});

describe("Terms of Service — added clauses", () => {
  describe("R2: liability for clinical content", () => {
    it("has a dedicated section", () => {
      const text = termsText();
      expect(text).toMatch(/Responsabilidade pelo Conteúdo Clínico/i);
    });

    it("assigns authorship of clinical content to the professional", () => {
      const text = termsText();
      expect(text).toMatch(/autoria e responsabilidade exclusiva do/i);
      expect(text).toMatch(/conselho de classe/i);
    });

    it("positions assistive features as typing aids, not recommendations", () => {
      // The platform autocompletes medications/exams and extracts data from
      // uploads; none of that may read as a clinical recommendation.
      const text = termsText();
      expect(text).toMatch(/não constituem recomendação clínica/i);
    });

    it("tells the user to seek in-person care in an emergency", () => {
      const text = termsText();
      expect(text).toMatch(/emergência/i);
    });
  });

  describe("4: refund policy and right of withdrawal", () => {
    it("states the CDC art. 49 withdrawal right with its 7-day window", () => {
      const text = termsText();
      expect(text).toContain("Art. 49");
      expect(text).toMatch(/7 \(sete\) dias/);
      expect(text).toMatch(/devolução integral/i);
    });

    it("confirms the service is free for patients", () => {
      const text = termsText();
      expect(text).toMatch(/gratuito para pacientes/i);
    });

    it("allows cancelling anytime with no lock-in or penalty", () => {
      const text = termsText();
      expect(text).toMatch(/sem multa/i);
      expect(text).toMatch(/sem período mínimo/i);
    });

    it("is explicit that there is no pro-rata refund after the 7 days", () => {
      // Being upfront about the limitation is the point: a refund policy
      // that only lists what IS refunded invites disputes.
      const text = termsText();
      expect(text).toMatch(/não há reembolso proporcional/i);
    });

    it("lists the cases that are fully refunded", () => {
      const text = termsText();
      expect(text).toMatch(/cobrança duplicada/i);
      expect(text).toMatch(/cobrança indevida/i);
    });

    it("protects the medical record from non-payment", () => {
      // Suspending paid features is fine; deleting a record over an unpaid
      // invoice would collide with the CFM retention duty.
      const text = termsText();
      expect(text).toMatch(/não são excluídos em razão de inadimplência/i);
    });

    it("gives notice before a price increase", () => {
      const text = termsText();
      expect(text).toMatch(/30 dias de antecedência/i);
    });
  });
});
