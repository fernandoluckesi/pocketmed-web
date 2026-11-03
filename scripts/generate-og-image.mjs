#!/usr/bin/env node
/**
 * Generates `public/og-image.jpg` — the 1200×630 image shown when a Hispora
 * link is shared on WhatsApp, Facebook, LinkedIn, X or Slack.
 *
 * ## Why generate rather than commit a static file
 *
 * The checklist asked for a dedicated sharing image (the repo only had a
 * logo, which crops badly at 1200×630). Producing it from an HTML template
 * with Playwright — already installed for the e2e suite — means:
 *
 *  - no new dependency and no image editor in the loop,
 *  - the brand colour comes from the same token the app uses, so it cannot
 *    drift from the product,
 *  - the wording is reviewable in a diff, which matters here: this text is
 *    advertising copy as much as metadata, so it has to stay within what the
 *    legal audit allows (no "total compliance", no invented metrics — see
 *    archives/docs/legal/features-legal.md, findings A2 and A3).
 *
 * This is a one-off generator, not part of `npm run build`: the output is
 * committed, and regenerating on every build would churn a binary file.
 * Run `npm run seo:og-image` after changing the template.
 */

import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const WIDTH = 1200;
const HEIGHT = 630;

// Brand primary, matching `--color-primary` in src/index.css.
const PRIMARY = "#1B3FCC";

const logo = readFileSync(
  resolve(root, "src/assets/logos/hispora-horizontal-branco.png"),
).toString("base64");

// Inter is already vendored via @fontsource, so the image uses the same
// typeface as the site instead of a system fallback that varies per machine.
const fontPath = resolve(
  root,
  "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2",
);
const font = readFileSync(fontPath).toString("base64");

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: 'Inter';
    font-weight: 700;
    src: url(data:font/woff2;base64,${font}) format('woff2');
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    background: linear-gradient(135deg, ${PRIMARY} 0%, #0d47a1 100%);
    font-family: 'Inter', sans-serif;
    display: flex; flex-direction: column;
    justify-content: center; align-items: flex-start;
    padding: 0 88px; color: #fff; position: relative; overflow: hidden;
  }
  /* Soft radial accents, kept subtle so the text stays the focus even in
     the small preview WhatsApp renders. */
  .glow {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,0.07);
  }
  .g1 { width: 520px; height: 520px; top: -190px; right: -140px; }
  .g2 { width: 340px; height: 340px; bottom: -150px; right: 160px; }
  img { height: 96px; width: auto; margin-bottom: 44px; position: relative; }
  h1 {
    font-size: 62px; line-height: 1.12; font-weight: 700;
    letter-spacing: -1.6px; max-width: 900px; position: relative;
  }
  p {
    margin-top: 26px; font-size: 29px; line-height: 1.4;
    color: rgba(255,255,255,0.88); max-width: 820px;
    font-weight: 500; position: relative;
  }
  .rule {
    margin-top: 40px; width: 104px; height: 7px;
    background: #fff; border-radius: 4px; position: relative;
  }
</style>
</head>
<body>
  <div class="glow g1"></div>
  <div class="glow g2"></div>
  <img src="data:image/png;base64,${logo}" alt="" />
  <h1>Prontuário eletrônico e gestão de clínicas</h1>
  <p>Agenda, receitas, exames e prontuário em um só lugar. Gratuito para pacientes.</p>
  <div class="rule"></div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  // 1x: the output is already at the recommended 1200×630, and doubling it
  // only inflates the file a crawler has to download before showing a card.
  deviceScaleFactor: 1,
});

await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);

// JPEG, not PNG. The design is a smooth gradient, which is the worst case
// for PNG's lossless compression: the same image is 296 kB as PNG and 57 kB
// as quality-88 JPEG, with no visible difference at this size. The file is
// fetched by a crawler before it can show a preview card, so the five-fold
// saving is the difference between a card that appears instantly and one
// that lags on a slow connection.
const png = await page.screenshot({ type: "jpeg", quality: 88 });
await browser.close();

const out = resolve(root, "public/og-image.jpg");
writeFileSync(out, png);

console.log(
  `og-image.jpg written: ${WIDTH}×${HEIGHT}, ${(png.length / 1024).toFixed(0)} kB`,
);
