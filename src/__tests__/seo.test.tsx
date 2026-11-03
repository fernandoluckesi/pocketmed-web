import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SEO } from "../components/SEO";
import {
  PUBLIC_PAGES,
  SITE_URL,
  canonicalUrl,
  allPublicPaths,
  seoFor,
} from "../constants/seo";
import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
} from "../utils/structured-data";
import { COMPANY } from "../constants/company";

/**
 * Unit-level checks on the SEO config and the `<SEO>` component.
 *
 * These are the fast half of the safety net. The other half,
 * `scripts/verify-seo.mjs`, asserts the same properties over HTTP against
 * the built site — because the three worst bugs in this work (the SPA
 * server discarding every prerendered page, React shipping two `<title>`
 * elements, and prerendering `/` corrupting the shell) were all invisible
 * at this level and only showed up in a real request.
 *
 * What belongs here: rules about the *content* of the metadata, which are
 * cheap to check and would otherwise only be caught by reading a Search
 * Console report weeks later.
 */

describe("public page config", () => {
  it("has no duplicate canonical paths", () => {
    const paths = PUBLIC_PAGES.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("has no path serving as both a canonical and an alias", () => {
    // This would be self-contradictory: the page would declare a canonical
    // pointing at itself and at another URL.
    const canonicals = new Set(PUBLIC_PAGES.map((p) => p.path));
    const aliases = PUBLIC_PAGES.flatMap((p) => p.aliases ?? []);
    for (const alias of aliases) {
      expect(canonicals.has(alias)).toBe(false);
    }
  });

  it("never reuses an alias across two pages", () => {
    const aliases = PUBLIC_PAGES.flatMap((p) => p.aliases ?? []);
    expect(new Set(aliases).size).toBe(aliases.length);
  });

  it("gives every page a unique title and description", () => {
    // Duplicate titles across pages are the exact problem this work set out
    // to fix — every public URL used to share one title.
    const titles = PUBLIC_PAGES.map((p) => p.title);
    const descriptions = PUBLIC_PAGES.map((p) => p.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("keeps titles within the length Google renders", () => {
    // ~60 chars is where Google starts truncating in the SERP. Going over
    // isn't an error, but the tail stops being read, so the distinguishing
    // words must come early. 70 is the hard ceiling enforced here.
    for (const page of PUBLIC_PAGES) {
      expect(
        page.title.length,
        `${page.path}: "${page.title}"`,
      ).toBeLessThanOrEqual(70);
      expect(page.title.length, page.path).toBeGreaterThan(15);
    }
  });

  it("keeps descriptions within the length Google renders", () => {
    // Google truncates descriptions around 155-160 chars.
    for (const page of PUBLIC_PAGES) {
      expect(page.description.length, page.path).toBeGreaterThan(50);
      expect(page.description.length, page.path).toBeLessThanOrEqual(175);
    }
  });

  it("names the product in every title", () => {
    for (const page of PUBLIC_PAGES) {
      expect(page.title.toLowerCase(), page.path).toContain("hispora");
    }
  });

  it("starts every path with a slash and adds no trailing slash", () => {
    for (const path of allPublicPaths()) {
      expect(path.startsWith("/"), path).toBe(true);
      if (path !== "/") expect(path.endsWith("/"), path).toBe(false);
    }
  });

  it("assigns the homepage the highest priority", () => {
    const home = seoFor("/");
    expect(home.priority).toBe(1.0);
    for (const page of PUBLIC_PAGES.filter((p) => p.path !== "/")) {
      expect(page.priority).toBeLessThan(1.0);
    }
  });

  it("throws a useful error for an unconfigured path", () => {
    // A page rendering `<SEO>` with undefined metadata would ship an empty
    // title, so this fails loudly instead.
    expect(() => seoFor("/nao-existe")).toThrow(/public-pages\.json/);
  });
});

describe("canonicalUrl", () => {
  it("keeps the trailing slash only for the root", () => {
    expect(canonicalUrl("/")).toBe(`${SITE_URL}/`);
    expect(canonicalUrl("/termos")).toBe(`${SITE_URL}/termos`);
  });

  it("produces absolute https URLs", () => {
    for (const path of allPublicPaths()) {
      expect(canonicalUrl(path)).toMatch(/^https:\/\/hispora\.com\.br/);
    }
  });
});

describe("<SEO>", () => {
  /** React 19 hoists metadata into document.head, so that is where the
   * assertions look — no Helmet provider involved. */
  function headContent(selector: string, attr = "content") {
    return document.head.querySelector(selector)?.getAttribute(attr) ?? null;
  }

  it("renders title, description and canonical", () => {
    render(<SEO title="T" description="D" canonical="/termos" />);
    expect(document.title).toBe("T");
    expect(headContent('meta[name="description"]')).toBe("D");
    expect(headContent('link[rel="canonical"]', "href")).toBe(
      `${SITE_URL}/termos`,
    );
  });

  it("defaults to indexable", () => {
    render(<SEO title="T" description="D" canonical="/" />);
    expect(headContent('meta[name="robots"]')).toBe("index, follow");
  });

  it("emits noindex, nofollow when asked", () => {
    // The security-relevant case: the record-consent and signing pages put
    // single-use tokens in the URL, and the default would publish them.
    render(
      <SEO title="T" description="D" canonical="/acesso-prontuario" noindex />,
    );
    expect(headContent('meta[name="robots"]')).toBe("noindex, nofollow");
  });

  it("emits an absolute og:image", () => {
    // Relative og:image is silently ignored by every social crawler.
    render(<SEO title="T" description="D" canonical="/" />);
    const image = headContent('meta[property="og:image"]');
    expect(image).toMatch(/^https:\/\//);
  });

  it("matches og:url to the canonical", () => {
    render(<SEO title="T" description="D" canonical="/suporte" />);
    expect(headContent('meta[property="og:url"]')).toBe(
      headContent('link[rel="canonical"]', "href"),
    );
  });

  it("declares og:image dimensions so the card renders before the image loads", () => {
    render(<SEO title="T" description="D" canonical="/" />);
    expect(headContent('meta[property="og:image:width"]')).toBe("1200");
    expect(headContent('meta[property="og:image:height"]')).toBe("630");
  });

  it("requests a large Twitter card", () => {
    render(<SEO title="T" description="D" canonical="/" />);
    expect(headContent('meta[name="twitter:card"]')).toBe(
      "summary_large_image",
    );
  });

  // React hoists <title>/<meta>/<link> into <head>, but NOT <script> — the
  // JSON-LD blocks stay where they render, in the body. That is fine:
  // Google accepts structured data in either location (confirmed by John
  // Mueller, 2019). The assertions therefore query the whole document, and
  // this comment exists so nobody "fixes" it back to document.head.
  it("serialises JSON-LD as valid JSON", () => {
    const { container } = render(
      <SEO
        title="T"
        description="D"
        canonical="/"
        jsonLd={{ "@type": "Organization", name: "Hispora" }}
      />,
    );
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).not.toBeNull();
    expect(() => JSON.parse(script!.textContent!)).not.toThrow();
    expect(JSON.parse(script!.textContent!).name).toBe("Hispora");
  });

  it("renders one script per JSON-LD block", () => {
    const { container } = render(
      <SEO
        title="T"
        description="D"
        canonical="/"
        jsonLd={[
          { "@type": "Organization" },
          { "@type": "SoftwareApplication" },
        ]}
      />,
    );
    expect(
      container.querySelectorAll('script[type="application/ld+json"]').length,
    ).toBe(2);
  });
});

describe("structured data", () => {
  it("builds valid Organization data from the published company record", () => {
    const org = organizationJsonLd(COMPANY);
    expect(org["@context"]).toBe("https://schema.org");
    expect(org["@type"]).toBe("Organization");
    // Reusing COMPANY is the point: the CNPJ/address published for LGPD
    // purposes and the one Google reads cannot drift apart.
    expect(org.legalName).toBe(COMPANY.legalName);
    expect(JSON.stringify(org)).not.toContain("undefined");
  });

  it("splits the address into real PostalAddress fields", () => {
    // A single concatenated `streetAddress` is valid but opaque to Google.
    const { address } = organizationJsonLd(COMPANY);
    expect(address.addressLocality).toBe("São Paulo");
    expect(address.addressRegion).toBe("SP");
    expect(address.postalCode).toBe("05424-150");
    expect(address.addressCountry).toBe("BR");
  });

  it("keeps the structured address consistent with the published one", () => {
    // `COMPANY.address` is rendered in the footer and the Privacy Policy;
    // `addressParts` feeds Google. They are written by hand, so this is the
    // guard against the two drifting apart after a move.
    const { street, district, city, state, postalCode } = COMPANY.addressParts;
    for (const fragment of [street, district, city, state, postalCode]) {
      expect(COMPANY.address, `missing "${fragment}"`).toContain(fragment);
    }
  });

  it("describes Hispora as software, not as a healthcare provider", () => {
    // Claiming MedicalBusiness/MedicalOrganization would tell Google the
    // company provides care. It sells software to clinics; it does not
    // practise medicine.
    const app = softwareApplicationJsonLd();
    expect(app["@type"]).toBe("SoftwareApplication");
    expect(app.applicationCategory).toBe("HealthApplication");
  });

  it("claims no ratings or reviews", () => {
    // Fabricated review markup is one of the few things Google issues
    // manual penalties for, and inventing testimonials is exactly what the
    // legal audit had to strip from the landing page (finding A3).
    const serialised = JSON.stringify(softwareApplicationJsonLd());
    expect(serialised).not.toContain("aggregateRating");
    expect(serialised).not.toContain("reviewCount");
    expect(serialised).not.toContain("ratingValue");
  });

  it("states the free-for-patients price accurately", () => {
    const app = softwareApplicationJsonLd();
    expect(app.offers.price).toBe("0");
    expect(app.offers.priceCurrency).toBe("BRL");
  });

  it("builds a FAQPage with one entity per question", () => {
    const faqs = [
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
    ];
    const faq = faqJsonLd(faqs);
    expect(faq.mainEntity).toHaveLength(2);
    expect(faq.mainEntity[0].name).toBe("Q1");
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe("A1");
  });

  it("numbers breadcrumb positions from 1 and resolves absolute URLs", () => {
    const crumbs = breadcrumbJsonLd([
      { name: "Início", path: "/" },
      { name: "Institucional", path: "/institutional" },
    ]);
    expect(crumbs.itemListElement[0].position).toBe(1);
    expect(crumbs.itemListElement[1].position).toBe(2);
    expect(crumbs.itemListElement[1].item).toBe(`${SITE_URL}/institutional`);
  });
});
