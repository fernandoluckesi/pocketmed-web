import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  canonicalUrl,
} from "../constants/seo";

/**
 * Schema.org JSON-LD builders for the public pages.
 *
 * Separate from `components/SEO.tsx` because these are plain functions, not
 * components — mixing them in a component module breaks React Fast Refresh
 * (eslint `react-refresh/only-export-components` flags exactly this).
 *
 * The overriding rule for everything in this file: **structured data must
 * describe what the product actually is.** Schema.org markup is a statement
 * to Google, and an inaccurate one is both a manual-action risk and the
 * same category of problem as the false security claims the legal audit had
 * to strip from the landing page.
 *
 * @see archives/docs/SEO/seo-checklist-hispora.md — section 5
 * @see archives/docs/legal/features-legal.md — findings A2, A3
 */

/** `Organization` for the landing page.
 *
 * Built from `COMPANY` so the legal identification published for LGPD
 * purposes (CNPJ, address) and the one Google reads are the same values. */
export function organizationJsonLd(company: {
  legalName: string;
  contactEmail: string;
  addressParts: {
    street: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
  };
}) {
  const a = company.addressParts;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: company.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    image: DEFAULT_OG_IMAGE,
    // Split into real PostalAddress fields rather than one `streetAddress`
    // blob. Google parses these individually for local/knowledge-panel
    // results; a single concatenated line is technically valid but is read
    // as an opaque string.
    address: {
      "@type": "PostalAddress",
      streetAddress: `${a.street} - ${a.district}`,
      addressLocality: a.city,
      addressRegion: a.state,
      postalCode: a.postalCode,
      addressCountry: "BR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: company.contactEmail,
      contactType: "customer support",
      availableLanguage: ["Portuguese"],
    },
  };
}

/** `SoftwareApplication` — the accurate type for Hispora.
 *
 * Deliberately NOT `MedicalBusiness`/`MedicalOrganization`, which the SEO
 * checklist offered as an alternative. Those types describe an entity that
 * *provides care* — a clinic, a hospital. Hispora sells software to clinics
 * and does not practise medicine; claiming otherwise would tell Google the
 * company is a healthcare provider, which it is not. `HealthApplication` as
 * the category conveys the domain without the misrepresentation. */
export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web, iOS, Android",
    url: SITE_URL,
    description:
      "Prontuário eletrônico, agendamento e gestão para clínicas e médicos, com aplicativo gratuito para pacientes.",
    inLanguage: "pt-BR",
    offers: {
      "@type": "Offer",
      // Accurate and verifiable: the patient app is free, clinics pay.
      //
      // No `aggregateRating`/`review` here, deliberately. Inventing review
      // counts is what the legal audit had to remove from the landing page
      // (finding A3), and fake review markup is one of the few things
      // Google issues manual penalties for. It goes back only when there
      // are real, attributable reviews.
      price: "0",
      priceCurrency: "BRL",
      description: "Gratuito para pacientes. Planos pagos para clínicas.",
    },
  };
}

/** `FAQPage` from the support page's visible Q&A.
 *
 * Google requires the marked-up questions to be visible on the page, so
 * this is built from the same array the page renders — there is no way to
 * mark up a question that isn't shown. */
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** `BreadcrumbList` for the nested institutional pages. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}
