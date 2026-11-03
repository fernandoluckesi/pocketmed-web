#!/usr/bin/env node
/**
 * Verifies the built site the way a crawler sees it: over HTTP, from the
 * real production server, with JavaScript never executed.
 *
 * ## Why this exists as a separate check
 *
 * Every SEO change in this project was initially "done" and silently broken
 * in a way only an HTTP request could reveal:
 *
 *  - `serve dist -s` discarded all 15 prerendered pages and served the
 *    landing page HTML for every route. The files on disk were perfect.
 *  - React appends its hoisted `<title>` instead of replacing the static
 *    one, so every page shipped two `<title>` elements.
 *  - Prerendering `/` mid-crawl overwrote the SPA shell, making every later
 *    page inherit the landing page's canonical.
 *
 * None of those are visible by reading the source, and all three are the
 * kind of bug that costs weeks of bad indexing before anyone notices. So
 * the assertions live here and run against the artefact.
 *
 * Usage: `npm run build && npm run seo:verify`
 */

import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

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

/** Wait for the server to accept connections instead of sleeping a guess. */
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

const failures = [];
const checks = [];

function check(name, condition, detail = "") {
  checks.push(name);
  if (!condition) failures.push(`${name}${detail ? " — " + detail : ""}`);
}

function meta(html, attr, value) {
  const re = new RegExp(
    `<meta[^>]+${attr}="${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*content="([^"]*)"`,
    "i",
  );
  return html.match(re)?.[1] ?? null;
}

/** Strip comments, then tags, to approximate what a crawler reads as text. */
function visibleText(html) {
  const body = html.slice(html.indexOf('<div id="root">'));
  return body
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

try {
  await waitForServer();

  // ---- robots.txt --------------------------------------------------------
  {
    const res = await fetch(base + "/robots.txt");
    const body = await res.text();
    check("robots.txt is served", res.status === 200, `HTTP ${res.status}`);
    check(
      "robots.txt is text/plain, not the SPA shell",
      (res.headers.get("content-type") ?? "").includes("text/plain"),
      res.headers.get("content-type") ?? "",
    );
    check("robots.txt references the sitemap", body.includes("Sitemap:"));
    for (const p of ["/dashboard", "/patients", "/financial"]) {
      check(`robots.txt disallows ${p}`, body.includes(`Disallow: ${p}`));
    }
    check(
      "robots.txt disallows the token routes",
      body.includes("Disallow: /acesso-prontuario/") &&
        body.includes("Disallow: /assinatura-simulada/"),
    );
  }

  // ---- sitemap.xml -------------------------------------------------------
  {
    const res = await fetch(base + "/sitemap.xml");
    const body = await res.text();
    check("sitemap.xml is served", res.status === 200, `HTTP ${res.status}`);
    check(
      "sitemap.xml is XML, not the SPA shell",
      (res.headers.get("content-type") ?? "").includes("xml"),
      res.headers.get("content-type") ?? "",
    );
    for (const page of config.pages) {
      const loc =
        page.path === "/"
          ? "https://hispora.com.br/"
          : "https://hispora.com.br" + page.path;
      check(`sitemap lists ${page.path}`, body.includes(`<loc>${loc}</loc>`));
    }
    // Aliases must NOT be listed: they declare a different canonical, so
    // advertising them asks Google to index URLs we told it to ignore.
    for (const page of config.pages) {
      for (const alias of page.aliases ?? []) {
        check(
          `sitemap omits the alias ${alias}`,
          !body.includes(`<loc>https://hispora.com.br${alias}</loc>`),
        );
      }
    }
  }

  // ---- og image ----------------------------------------------------------
  {
    const res = await fetch(base + "/og-image.jpg");
    check("og-image.jpg is served", res.status === 200, `HTTP ${res.status}`);
    check(
      "og-image.jpg is sent as an image",
      (res.headers.get("content-type") ?? "").startsWith("image/"),
      res.headers.get("content-type") ?? "",
    );
    // Measured from the body, not Content-Length: the server streams the
    // file and does not set that header.
    const bytes = (await res.arrayBuffer()).byteLength;
    check(
      "og-image.jpg is under 300 kB",
      bytes > 0 && bytes < 300_000,
      `${Math.round(bytes / 1024)} kB`,
    );
  }

  // ---- every public page, canonical + aliases ----------------------------
  for (const page of config.pages) {
    const paths = [page.path, ...(page.aliases ?? [])];
    for (const path of paths) {
      const res = await fetch(base + path);
      const html = await res.text();
      const label = path.padEnd(22);

      check(`${label} HTTP 200`, res.status === 200, `HTTP ${res.status}`);

      const markup = html.replace(/<!--[\s\S]*?-->/g, "");
      const titles = markup.match(/<title[^>]*>([^<]*)<\/title>/g) ?? [];
      check(
        `${label} has exactly one <title>`,
        titles.length === 1,
        `found ${titles.length}`,
      );
      const title = markup.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? "";
      check(
        `${label} title is the page's own`,
        title === page.title,
        `got "${title}"`,
      );

      const canonicals =
        markup.match(/<link[^>]+rel="canonical"[^>]*>/g) ?? [];
      check(
        `${label} has exactly one canonical`,
        canonicals.length === 1,
        `found ${canonicals.length}`,
      );
      const href = markup.match(
        /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/,
      )?.[1];
      const expected =
        page.path === "/"
          ? "https://hispora.com.br/"
          : "https://hispora.com.br" + page.path;
      check(
        `${label} canonical points at ${page.path}`,
        href === expected,
        `got ${href}`,
      );

      check(
        `${label} description matches`,
        meta(markup, "name", "description") === page.description,
      );
      check(
        `${label} is indexable`,
        meta(markup, "name", "robots") === "index, follow",
        meta(markup, "name", "robots") ?? "missing",
      );
      check(
        `${label} has og:title/description/image/url`,
        !!meta(markup, "property", "og:title") &&
          !!meta(markup, "property", "og:description") &&
          !!meta(markup, "property", "og:image") &&
          !!meta(markup, "property", "og:url"),
      );
      check(
        `${label} og:image is absolute`,
        (meta(markup, "property", "og:image") ?? "").startsWith("https://"),
      );
      check(
        `${label} og:url matches the canonical`,
        meta(markup, "property", "og:url") === expected,
      );
      check(
        `${label} has twitter:card`,
        meta(markup, "name", "twitter:card") === "summary_large_image",
      );

      // The point of prerendering: real content without running JS.
      const text = visibleText(markup);
      check(
        `${label} serves content without JS`,
        text.length > 600,
        `${text.length} chars`,
      );

      // Exactly one <h1>, which is the on-page SEO rule from section 7.
      const h1s = markup.match(/<h1[\s>]/g) ?? [];
      check(`${label} has exactly one <h1>`, h1s.length === 1, `found ${h1s.length}`);

      // Structured data must parse. A malformed block is silently dropped
      // by Google, so a typo would cost the rich result with no warning.
      const ld = [
        ...markup.matchAll(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
        ),
      ];
      for (const [, body] of ld) {
        let ok = true;
        try {
          JSON.parse(body);
        } catch {
          ok = false;
        }
        check(`${label} JSON-LD parses`, ok);
      }
      // `lang` is what tells Google the content is Brazilian Portuguese.
      check(
        `${label} declares lang="pt-BR"`,
        /<html[^>]+lang="pt-BR"/.test(markup),
      );

      // One <main> landmark, carrying the id the skip link points at.
      // Without the id the skip link is a dead anchor, which is worse than
      // no skip link: it takes a Tab stop and then does nothing.
      const mains = markup.match(/<main[\s>]/g) ?? [];
      check(`${label} has exactly one <main>`, mains.length === 1, `found ${mains.length}`);
      check(
        `${label} <main> carries the skip-link target id`,
        /<main[^>]+id="conteudo-principal"/.test(markup),
      );
      check(
        `${label} has a skip-to-content link`,
        markup.includes('href="#conteudo-principal"'),
      );

      // The build-time marker must be gone, and the preloads present. A
      // leftover marker means the injection silently skipped this document.
      check(`${label} has no leftover build marker`, !html.includes("FONT_PRELOAD"));
      const preloads = markup.match(/<link[^>]+rel="preload"[^>]*>/g) ?? [];
      check(
        `${label} preloads the above-the-fold fonts`,
        preloads.length === 2,
        `found ${preloads.length}`,
      );
      // A preload pointing at a missing file is worse than none: the
      // browser warns and still discovers the real font late.
      for (const tag of preloads) {
        const href = tag.match(/href="([^"]+)"/)?.[1];
        const res2 = await fetch(base + href);
        check(
          `${label} preloaded font ${href?.split("/").pop()} exists`,
          res2.status === 200,
          `HTTP ${res2.status}`,
        );
      }
    }
  }

  // ---- the SPA fallback must still work ----------------------------------
  for (const path of ["/dashboard", "/patients", "/login", "/rota-inexistente"]) {
    const res = await fetch(base + path);
    check(
      `SPA fallback ${path.padEnd(18)} returns 200`,
      res.status === 200,
      `HTTP ${res.status}`,
    );
  }

  // ---- caching -----------------------------------------------------------
  {
    const html = await fetch(base + "/termos");
    check(
      "HTML is not cached immutably",
      (html.headers.get("cache-control") ?? "").includes("no-cache"),
      html.headers.get("cache-control") ?? "",
    );

    // Find a real hashed asset from the built shell rather than guessing.
    const shell = readFileSync(resolve(root, "dist/index.html"), "utf8");
    const asset = shell.match(/\/assets\/[A-Za-z0-9._-]+\.js/)?.[0];
    if (asset) {
      const res = await fetch(base + asset);
      check(
        "fingerprinted assets are cached immutably",
        (res.headers.get("cache-control") ?? "").includes("immutable"),
        res.headers.get("cache-control") ?? "",
      );
    }
  }

  // ---- directory traversal ----------------------------------------------
  {
    const res = await fetch(base + "/../package.json");
    check(
      "path traversal does not escape dist/",
      res.status !== 200 || !(await res.text()).includes('"devDependencies"'),
    );
  }
} finally {
  server.kill();
}

console.log(`\n${checks.length} checks run, ${failures.length} failed.`);
if (failures.length) {
  console.error("\nFailures:");
  for (const f of failures) console.error("  ✗ " + f);
  process.exit(1);
}
console.log("All SEO checks passed.");
