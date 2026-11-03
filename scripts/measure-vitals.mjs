#!/usr/bin/env node
/**
 * Measures LCP, CLS and payload for the public pages against the built
 * site, using the Chromium that Playwright already installs.
 *
 * ## Why not Lighthouse
 *
 * Lighthouse would add a large dependency to report the same vitals plus a
 * composite score. The score is useful for a dashboard; the raw LCP/CLS and
 * the transferred bytes are what tell you whether a change helped. This
 * reads them straight from the browser's PerformanceObserver — the same
 * source Lighthouse uses.
 *
 * Numbers from a local server over loopback are optimistic in absolute
 * terms: there is no network latency. They are reliable for *comparison*
 * (before/after a change) and for catching a regression such as a 1 MB
 * image reappearing. Field data still has to come from PageSpeed Insights
 * or Search Console against production.
 *
 * Usage: `npm run build && npm run perf`
 */

import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

if (!existsSync(resolve(root, "dist/index.html"))) {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(1);
}

const config = JSON.parse(
  readFileSync(resolve(root, "src/constants/public-pages.json"), "utf8"),
);

// Port 0 lets the OS pick a free one, so a leftover process from an earlier
// run can't make this fail with a confusing connection error.
const PORT = 0;
let base = "";

const server = spawn(process.execPath, [resolve(here, "serve-static.mjs")], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: ["pipe", "pipe", "inherit"],
});

/** Read the port the server actually bound to off its stdout. */
const boundPort = await new Promise((ok, fail) => {
  const timer = setTimeout(() => fail(new Error("server did not report a port")), 15_000);
  let buf = "";
  server.stdout.on("data", (chunk) => {
    buf += chunk.toString();
    const m = buf.match(/:(\d+)/);
    if (m) {
      clearTimeout(timer);
      ok(Number(m[1]));
    }
  });
});
base = `http://127.0.0.1:${boundPort}`;

async function waitForServer(timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(base + "/robots.txt");
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  throw new Error("server did not start");
}

/** Thresholds are Google's "good" bands for LCP and CLS. */
const LCP_GOOD_MS = 2500;
const CLS_GOOD = 0.1;

const rows = [];
const failures = [];

try {
  await waitForServer();
  const browser = await chromium.launch();

  for (const page of config.pages) {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const tab = await ctx.newPage();

    let bytes = 0;
    const byType = {};
    tab.on("response", async (res) => {
      try {
        const buf = await res.body();
        bytes += buf.length;
        const type = (res.headers()["content-type"] ?? "other").split(";")[0];
        byType[type] = (byType[type] ?? 0) + buf.length;
      } catch {
        // Redirects and aborted requests have no body; ignore.
      }
    });

    await tab.goto(base + page.path, { waitUntil: "networkidle" });

    const vitals = await tab.evaluate(
      () =>
        new Promise((done) => {
          let lcp = 0;
          let cls = 0;
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) lcp = Math.max(lcp, e.startTime);
          }).observe({ type: "largest-contentful-paint", buffered: true });
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
              if (!e.hadRecentInput) cls += e.value;
            }
          }).observe({ type: "layout-shift", buffered: true });

          // Give the observers a moment to flush, then read the paint
          // timings that are already settled.
          setTimeout(() => {
            const fcp = performance
              .getEntriesByType("paint")
              .find((e) => e.name === "first-contentful-paint");
            done({
              lcp: Math.round(lcp),
              cls: +cls.toFixed(4),
              fcp: Math.round(fcp?.startTime ?? 0),
            });
          }, 600);
        }),
    );

    rows.push({ path: page.path, ...vitals, kb: Math.round(bytes / 1024) });

    if (vitals.lcp > LCP_GOOD_MS) {
      failures.push(`${page.path}: LCP ${vitals.lcp} ms exceeds ${LCP_GOOD_MS}`);
    }
    if (vitals.cls > CLS_GOOD) {
      failures.push(`${page.path}: CLS ${vitals.cls} exceeds ${CLS_GOOD}`);
    }

    await ctx.close();
  }

  await browser.close();
} finally {
  server.kill();
}

console.log("\nCore Web Vitals (local, no network latency — compare, don't publish)\n");
console.log(
  `${"route".padEnd(24)} ${"FCP".padStart(7)} ${"LCP".padStart(8)} ${"CLS".padStart(7)} ${"payload".padStart(9)}`,
);
for (const r of rows) {
  console.log(
    `${r.path.padEnd(24)} ${(r.fcp + "ms").padStart(7)} ${(r.lcp + "ms").padStart(8)} ${String(r.cls).padStart(7)} ${(r.kb + " kB").padStart(9)}`,
  );
}

const worstLcp = Math.max(...rows.map((r) => r.lcp));
const worstCls = Math.max(...rows.map((r) => r.cls));
console.log(
  `\nworst LCP ${worstLcp} ms (good < ${LCP_GOOD_MS}), worst CLS ${worstCls} (good < ${CLS_GOOD})`,
);

if (failures.length) {
  console.error("\nOver threshold:");
  for (const f of failures) console.error("  • " + f);
  process.exit(1);
}
console.log("All public pages within Google's 'good' thresholds.");
