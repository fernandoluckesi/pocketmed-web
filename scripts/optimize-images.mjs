#!/usr/bin/env node
/**
 * Converts the oversized raster assets to WebP.
 *
 * ## Why
 *
 * `src/assets/images/mobile.png` was **1.22 MB** and is the hero image on
 * the landing page and the institutional mobile page — i.e. the Largest
 * Contentful Paint element on the two pages that matter most for SEO. Core
 * Web Vitals is a direct ranking factor, and LCP is the vital this hurts.
 *
 * Two problems, both fixed here:
 *
 *  1. **Format.** PNG is lossless, which is the wrong trade for a
 *     photographic product screenshot. At WebP quality 85 the same image is
 *     126 kB — a 90% saving with no visible difference.
 *  2. **Dimensions.** The source is 1024×1536 but CSS renders it at 300 px
 *     wide (`w-[300px]`). The browser was downloading ~11× more pixels than
 *     it could display, then spending main-thread time resizing them. The
 *     output is capped at 900 px wide, which still covers a 3× DPR screen
 *     at that size.
 *
 * ## Why Chromium rather than `sharp`
 *
 * `sharp` would mean a new native dependency that has to compile per
 * platform. Playwright's Chromium is already installed for the e2e suite
 * and encodes WebP natively via `canvas.toBlob`. No new dependency.
 *
 * Output is committed; this is a one-off to re-run when a source image
 * changes (`npm run images:optimize`), not part of the build.
 */

import { readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

/** `maxWidth` is generous relative to the CSS size so high-DPR screens are
 * still sharp; `quality` is the point where artefacts stop being visible on
 * these particular images. */
const TARGETS = [
  {
    src: "src/assets/images/mobile.png",
    out: "src/assets/images/mobile.webp",
    maxWidth: 900,
    quality: 0.85,
  },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const t of TARGETS) {
  const srcPath = resolve(root, t.src);
  const before = statSync(srcPath).size;
  const b64 = readFileSync(srcPath).toString("base64");

  await page.setContent(
    `<img id="i" src="data:image/png;base64,${b64}">`,
  );
  await page.waitForFunction(
    () => document.getElementById("i").naturalWidth > 0,
  );

  const result = await page.evaluate(
    async ({ maxWidth, quality }) => {
      const img = document.getElementById("i");
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((r) =>
        canvas.toBlob(r, "image/webp", quality),
      );
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return {
        data: Array.from(bytes),
        width: canvas.width,
        height: canvas.height,
      };
    },
    { maxWidth: t.maxWidth, quality: t.quality },
  );

  const buf = Buffer.from(result.data);
  writeFileSync(resolve(root, t.out), buf);

  const pct = Math.round((1 - buf.length / before) * 100);
  console.log(
    `${t.src} → ${t.out}\n` +
      `  ${Math.round(before / 1024)} kB → ${Math.round(buf.length / 1024)} kB ` +
      `(-${pct}%), ${result.width}×${result.height}`,
  );
}

await browser.close();
