#!/usr/bin/env node
/**
 * Injects `<link rel="preload">` for the fonts used above the fold.
 *
 * ## Why a build step instead of a line in index.html
 *
 * Vite fingerprints font filenames (`inter-latin-400-normal-C38fXH4l.woff2`),
 * so the hash is not knowable until after the build. A hand-written preload
 * would point at a stale filename the first time a font changed — and a
 * preload for a URL that 404s is worse than no preload: the browser warns,
 * and the real font is still discovered late.
 *
 * So the hashes are read out of the built CSS.
 *
 * ## Why preload at all, given `font-display: swap`
 *
 * `swap` means text paints immediately in a fallback face, so nothing is
 * *invisible*. The cost is the swap itself: the browser only discovers the
 * font URL after downloading and parsing the CSS, so the first paint uses
 * the fallback and then reflows to Inter. That reflow is layout shift
 * (CLS) and a visible flash (FOUT). Preloading starts the font download in
 * parallel with the CSS, which usually lands it before first paint.
 *
 * Only the two weights actually used above the fold are preloaded —
 * Inter 400 for body text and Manrope 800 for headings. Preloading all nine
 * would compete for bandwidth with the CSS and JS that gate first paint,
 * making the metric worse rather than better.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, "..", "dist");

/** Fonts that render above the fold on the public pages. */
const WANTED = [
  { match: /^inter-latin-400-normal-.*\.woff2$/, label: "Inter 400 (body)" },
  {
    match: /^manrope-latin-800-normal-.*\.woff2$/,
    label: "Manrope 800 (headings)",
  },
];

const assets = readdirSync(join(dist, "assets"));
const preloads = [];

for (const { match, label } of WANTED) {
  const file = assets.find((f) => match.test(f));
  if (!file) {
    console.error(`Font not found for ${label} (pattern ${match}).`);
    process.exit(1);
  }
  preloads.push({ href: `/assets/${file}`, label });
}

const tags = preloads
  .map(
    ({ href, label }) =>
      `    <!-- ${label} -->\n` +
      `    <link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin />`,
  )
  .join("\n");

const MARKER = "<!-- FONT_PRELOAD -->";

// Every prerendered document needs the tags, not just the shell: each one is
// a separate entry point for a visitor arriving from search.
const htmlFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "assets") walk(full);
    } else if (entry.name === "index.html") {
      htmlFiles.push(full);
    }
  }
})(dist);

let patched = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  if (!html.includes(MARKER)) continue;
  writeFileSync(file, html.replace(MARKER, tags.trimStart()), "utf8");
  patched++;
}

if (patched === 0) {
  console.error(
    `No file contained the ${MARKER} marker — index.html must keep it.`,
  );
  process.exit(1);
}

console.log(
  `Font preload injected into ${patched} document(s): ` +
    preloads.map((p) => p.label).join(", "),
);
