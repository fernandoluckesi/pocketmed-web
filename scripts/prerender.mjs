#!/usr/bin/env node
/**
 * Prerenders the public routes to static HTML after `vite build`.
 *
 * ## Why this exists
 *
 * The app is a client-only SPA, so `dist/index.html` has an empty `<div
 * id="root">` and one fixed `<title>`. Two consequences:
 *
 *  - **Social crawlers do not execute JavaScript at all.** WhatsApp,
 *    Facebook, LinkedIn, X and Slack read the raw HTML. Without this step,
 *    every link shared anywhere shows the same generic title and no image,
 *    no matter what the React `<SEO>` component renders.
 *  - Google *does* render JS, but on a delayed second pass and against a
 *    crawl budget. Static HTML is indexed on the first visit.
 *
 * ## Why Playwright instead of a Vite prerender plugin
 *
 * `@playwright/test` is already a devDependency with Chromium installed (it
 * runs the e2e suite). Driving a real browser over the built output adds
 * **zero new dependencies** and prerenders exactly what a user receives —
 * no second rendering path that can diverge from production, which is the
 * usual failure of SSR bolted onto a client-only app.
 *
 * The alternative in the checklist (migrating the public pages to
 * Next.js/Astro) is a far larger change for the same SEO outcome, and would
 * split the site across two frameworks.
 *
 * ## What it does NOT do
 *
 * This is prerendering, not SSR: output is a snapshot of the page as it
 * looks for an anonymous visitor at build time. That is correct for the
 * institutional/legal pages (static content) and wrong for anything
 * user-specific — which is why only public routes are listed.
 *
 * Hydration still happens: React takes over on load, so interactivity is
 * unchanged. A crawler just gets content before that.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { createServer } from "node:http";
import handler from "serve-handler";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dist = resolve(root, "dist");

if (!existsSync(join(dist, "index.html"))) {
  console.error("dist/index.html not found — run `vite build` first.");
  process.exit(1);
}

const config = JSON.parse(
  readFileSync(resolve(root, "src/constants/public-pages.json"), "utf8"),
);

/** Canonicals AND aliases. An alias needs its own static file: a crawler
 * following an inbound link to `/legal` must get a real document, which then
 * points its canonical at `/termos`. */
const routes = config.pages.flatMap((p) => [p.path, ...(p.aliases ?? [])]);

// ---------------------------------------------------------------------------
// Serve `dist` with SPA fallback, exactly like `serve dist -s` does in
// production, so the browser resolves every route the same way.
// ---------------------------------------------------------------------------
/**
 * Pristine SPA shell, captured before anything is written.
 *
 * This matters more than it looks. The naive version of this script writes
 * each page as it goes — but `/` writes to `dist/index.html`, which is the
 * very file the SPA fallback serves. Every route crawled after `/` would
 * then load the *prerendered landing page* as its starting document and
 * inherit its already-hoisted `<title>` and `<link rel="canonical">`,
 * producing two of each per page. A page with two canonicals pointing at
 * different URLs is worse than one with none: Google picks whichever it
 * likes, so `/termos` could end up canonicalised to the homepage.
 *
 * Fix: serve the shell from memory and keep every write until the crawl is
 * finished.
 */
const shell = readFileSync(join(dist, "index.html"), "utf8");

const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
  // Serve the in-memory shell for anything that isn't a real asset, which is
  // what `serve dist -s` does in production — but always the pristine copy.
  const isAsset = /\.[a-z0-9]+$/i.test(path);
  if (!isAsset) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(shell);
    return;
  }
  return handler(req, res, { public: dist });
});

await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const port = server.address().port;
const origin = `http://127.0.0.1:${port}`;

const browser = await chromium.launch();
const failures = [];
/** Rendered documents, flushed to disk only after the whole crawl succeeds. */
const pending = [];
let written = 0;

try {
  for (const route of routes) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));

    try {
      await page.goto(origin + route, {
        waitUntil: "networkidle",
        timeout: 30_000,
      });

      // The metadata is the whole point of this step, so wait for React to
      // have hoisted it rather than assuming `networkidle` was enough.
      await page.waitForFunction(
        () => !!document.querySelector('link[rel="canonical"]'),
        { timeout: 15_000 },
      );

      let html = await page.content();

      // The dev-time module script must not stay in the output; Vite's built
      // index.html already references the hashed bundle. (It won't be
      // present when prerendering `dist`, but assert rather than trust.)
      if (html.includes("/src/main.tsx")) {
        throw new Error("prerendered HTML references the dev entry point");
      }

      // Guard against shipping a page whose content never rendered — an
      // empty root would mean we replaced a working SPA shell with a blank
      // document, which is worse than not prerendering at all.
      const rootHtml = await page.$eval("#root", (el) => el.innerHTML.trim());
      if (rootHtml.length < 500) {
        throw new Error(
          `#root rendered only ${rootHtml.length} chars — page looks empty`,
        );
      }

      const title = await page.title();
      const canonical = await page.$eval(
        'link[rel="canonical"]',
        (el) => el.getAttribute("href"),
      );
      const robots = await page
        .$eval('meta[name="robots"]', (el) => el.getAttribute("content"))
        .catch(() => null);

      if (errors.length) {
        throw new Error("console errors: " + errors.join("; "));
      }

      // Assert the fix above actually held: exactly one canonical and one
      // title per document. Two canonicals pointing at different URLs is
      // worse than none, because Google then picks one for us.
      //
      // Comments are stripped first — index.html documents this very rule
      // and mentions `<title>` in prose, which a naive count picks up.
      const markup = html.replace(/<!--[\s\S]*?-->/g, "");
      const canonicalCount = (markup.match(/rel="canonical"/g) ?? []).length;
      const titleCount = (markup.match(/<title[^>]*>/g) ?? []).length;
      if (canonicalCount !== 1 || titleCount !== 1) {
        throw new Error(
          `expected exactly 1 canonical and 1 title, got ${canonicalCount} and ${titleCount}`,
        );
      }

      // Staged, not written: see the note on `shell`. Writing `/` mid-crawl
      // would corrupt the fallback document for every route after it.
      const outDir =
        route === "/" ? dist : join(dist, ...route.split("/").filter(Boolean));
      pending.push({ outDir, html });
      written++;

      console.log(
        `  ✓ ${route.padEnd(24)} ${robots === "index, follow" ? "index " : "NOINDEX"} → ${title.slice(0, 52)}`,
      );
      if (!canonical) failures.push(`${route}: no canonical`);
    } catch (err) {
      failures.push(`${route}: ${err.message}`);
      console.error(`  ✗ ${route} — ${err.message}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`\nPrerender failed for ${failures.length} route(s):`);
  for (const f of failures) console.error("  • " + f);
  // Hard failure, and nothing is written: a half-prerendered site is a
  // confusing state to debug in production, where some URLs serve real HTML
  // and others an empty shell. `dist` is left exactly as `vite build` made
  // it, so the deploy is a working SPA rather than a broken hybrid.
  process.exit(1);
}

// Crawl succeeded — now it is safe to overwrite index.html.
for (const { outDir, html } of pending) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html, "utf8");
}

console.log(`\nPrerendered ${written} route(s) to static HTML.`);
