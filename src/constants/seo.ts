import publicPagesData from "./public-pages.json";

/**
 * SEO configuration for the public (unauthenticated) part of the site.
 *
 * The page table itself lives in `public-pages.json`, which is the single
 * source of truth shared by three consumers that must never disagree:
 *
 *   1. the per-page `<SEO>` metadata rendered by React (this module),
 *   2. `sitemap.xml` + `robots.txt` (scripts/generate-seo-files.mjs),
 *   3. the prerender step (scripts/prerender.mjs), which visits exactly
 *      these routes.
 *
 * JSON rather than a `.ts` array because the two build scripts run in plain
 * Node and would otherwise have to either duplicate the table or regex-parse
 * TypeScript. Duplication is the exact rot this is meant to prevent.
 *
 * @see archives/docs/SEO/seo-checklist-hispora.md
 */

/** Production origin, no trailing slash. Canonicals are absolute because a
 * relative canonical becomes ambiguous as soon as the page is also reachable
 * over a preview domain (Railway gives every deploy one). */
export const SITE_URL = "https://hispora.com.br";

/** Default social sharing image. Absolute by necessity: the crawlers for
 * WhatsApp/Facebook/X do not resolve relative paths in `og:image`. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const SITE_NAME = "Hispora";
export const LOCALE = "pt_BR";

export interface PublicPage {
  /** Canonical path, exactly as the router serves it. */
  path: string;
  title: string;
  description: string;
  /** Sitemap hints. `priority` is relative within this site only. */
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
  /** Extra paths that render this same page and must declare this path as
   * their canonical. They are real routes (kept so existing links and the
   * app-store submissions don't 404); without the canonical they would be
   * duplicate content. */
  aliases?: string[];
}

export const PUBLIC_PAGES: PublicPage[] = publicPagesData.pages as PublicPage[];

/** Absolute canonical URL for a path. The root keeps a trailing slash,
 * which is the form Google reports for a homepage. */
export function canonicalUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

/** Look up a page by canonical path, failing loudly rather than rendering a
 * page with `undefined` metadata. A missing entry is a developer error, and
 * a silently untitled public page is exactly the bug this config exists to
 * prevent. */
export function seoFor(path: string): PublicPage {
  const page = PUBLIC_PAGES.find((p) => p.path === path);
  if (!page) {
    throw new Error(
      `No SEO entry for "${path}". Add it to src/constants/public-pages.json.`,
    );
  }
  return page;
}

/** Every path the router serves publicly: canonicals plus aliases. Used by
 * the prerender step, because a crawler following an inbound link to an
 * alias must also receive a real document. */
export function allPublicPaths(): string[] {
  return PUBLIC_PAGES.flatMap((p) => [p.path, ...(p.aliases ?? [])]);
}
