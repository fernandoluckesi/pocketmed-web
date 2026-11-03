import {
  SITE_NAME,
  LOCALE,
  DEFAULT_OG_IMAGE,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  canonicalUrl,
} from "../constants/seo";

interface SEOProps {
  title: string;
  description: string;
  /** Canonical path (not URL). For a page reachable under several paths,
   * pass the ONE canonical path — that is what de-duplicates the aliases. */
  canonical: string;
  /** Absolute URL. Defaults to the site-wide sharing image. */
  image?: string;
  /** `website` for the landing page, `article` for legal/content pages. */
  type?: "website" | "article";
  /** Keeps the page out of the index while still letting crawlers follow
   * links. Used for pages that carry tokens in the URL. */
  noindex?: boolean;
  /** JSON-LD structured data, already shaped. Rendered verbatim. */
  jsonLd?: object | object[];
}

/**
 * Per-page metadata for the public site.
 *
 * ## Why there is no `react-helmet-async` here
 *
 * The SEO checklist suggested adding it. It isn't needed: **React 19 hoists
 * `<title>`, `<meta>` and `<link>` rendered anywhere in the tree into
 * `document.head` natively**, which is precisely what Helmet was invented to
 * do. This was verified against the installed version (19.2.6) before the
 * component was written, not assumed from the changelog.
 *
 * Skipping it avoids a dependency, a provider wrapper around the whole app,
 * and a library that has needed a maintained fork for exactly this reason.
 *
 * ## The limit worth knowing
 *
 * React only hoists this once the bundle has executed. Google renders JS and
 * will see it; **social crawlers (WhatsApp, Facebook, X, LinkedIn) do not
 * execute JS at all** and would read only the static `index.html`. That is
 * why the build also prerenders the public routes to real HTML files — see
 * `scripts/prerender.mjs`. The two work together: this component is the
 * source of truth, prerendering is what makes it visible without JS.
 */
export function SEO({
  title,
  description,
  canonical,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
}: SEOProps) {
  const url = canonicalUrl(canonical);
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Explicit robots directive. Being explicit matters on the token
          pages: the default is "index, follow", so silence there would mean
          publishing single-use access tokens to the index. */}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />

      {/* Open Graph — consumed by WhatsApp, Facebook, LinkedIn, Slack. */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={LOCALE} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
      {/* The titles already start with or contain "Hispora", so prefixing
          the site name here produced "Hispora — Hispora — …". The title
          alone describes the image adequately. */}
      <meta property="og:image:alt" content={title} />

      {/* Twitter/X. `summary_large_image` needs an image of at least
          300x157; ours is 1200x630, which is the recommended size. */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {blocks.map((block) => (
        <script
          // `@type` is unique per page here (Organization +
          // SoftwareApplication, or one of FAQPage/BreadcrumbList), and the
          // list never reorders, so it is a stable key.
          key={(block as { "@type": string })["@type"]}
          type="application/ld+json"
          // JSON.stringify is the escaping here. The content is built from
          // our own constants, never from user input, so there is no path
          // for injection — but note that `</script>` inside a string would
          // still need escaping if that ever changes.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
