#!/usr/bin/env node
/**
 * Production static server for `dist`.
 *
 * ## Why this replaced `serve dist -s`
 *
 * `serve -s` is "single-page application" mode: it rewrites **every**
 * extensionless request to the root `index.html`. That is exactly right for
 * a pure SPA and exactly wrong once routes are prerendered — it discarded
 * all 15 prerendered documents and served the landing page's HTML for
 * `/termos`, `/seguranca` and the rest. The prerendering worked; it was
 * simply unreachable in production.
 *
 * This was caught by requesting the routes from a real server rather than
 * trusting that the files on disk were what a crawler would receive.
 *
 * Configuring `serve.json` to do both was attempted first and abandoned:
 * `serve-handler` applies the first matching rewrite and then resolves only
 * the rewritten path, so a catch-all needed for the SPA also swallows the
 * prerendered routes. Expressing "prefer a real file, fall back to the
 * shell" is ~40 lines here and needs no dependency at all.
 *
 * ## The rule
 *
 *   1. a real file on disk        → serve it
 *   2. `<route>/index.html`       → serve it  (the prerendered pages)
 *   3. anything else              → the SPA shell, HTTP 200
 *
 * Step 3 must return 200, not 404: the authenticated app lives entirely on
 * client-side routes, and a 404 would break `/dashboard` on a hard refresh.
 */

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, "..", "dist");
// PORT=0 asks the OS for any free port, which the verification scripts use
// so a stale process can't collide with them.
const port = process.env.PORT === undefined ? 3000 : Number(process.env.PORT);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
  ".map": "application/json; charset=utf-8",
};

/**
 * Cache headers.
 *
 * Vite fingerprints everything under `/assets/`, so those are immutable and
 * can be cached for a year — that is what makes a repeat visit fast, and
 * Core Web Vitals is a ranking factor.
 *
 * HTML must NOT be cached that way: it is the file that references the
 * hashed bundles, so a stale copy pins a visitor to a deleted build.
 * `robots.txt`/`sitemap.xml` get a short TTL so a fix propagates in hours
 * rather than whenever a crawler decides to revalidate.
 */
function cacheControl(pathname, ext) {
  if (pathname.startsWith("/assets/")) {
    return "public, max-age=31536000, immutable";
  }
  if (ext === ".html" || pathname === "/") {
    return "no-cache";
  }
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return "public, max-age=3600";
  }
  // Un-fingerprinted assets (og-image.jpg, icon.png): a day is long enough
  // to help and short enough that replacing one takes effect quickly.
  return "public, max-age=86400";
}

function send(res, filePath, pathname, status = 200) {
  const ext = extname(filePath).toLowerCase();
  res.writeHead(status, {
    "Content-Type": MIME[ext] ?? "application/octet-stream",
    "Cache-Control": cacheControl(pathname, ext),
    "X-Content-Type-Options": "nosniff",
  });
  createReadStream(filePath).pipe(res);
}

/** Resolve a request path inside `dist`, refusing to escape it.
 * Without this, `/../../etc/passwd` would be served. */
function safeJoin(pathname) {
  const clean = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const target = join(dist, clean);
  if (target !== dist && !target.startsWith(dist + sep)) return null;
  return target;
}

const shell = join(dist, "index.html");

const server = createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }

  const pathname = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const target = safeJoin(pathname);

  if (!target) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // 1. An actual file: assets, robots.txt, sitemap.xml, og-image.jpg.
  if (existsSync(target) && statSync(target).isFile()) {
    send(res, target, pathname);
    return;
  }

  // 2. A prerendered route, i.e. `dist/<route>/index.html`.
  const indexFile = join(target, "index.html");
  if (existsSync(indexFile)) {
    send(res, indexFile, pathname + "/index.html");
    return;
  }

  // 3. SPA fallback — 200, because client-side routes are real routes.
  send(res, shell, "/index.html");
});

server.listen(port, () => {
  // Printing the resolved port (not the requested one) is what lets a
  // caller using PORT=0 find out where to connect.
  console.log(`Serving dist on :${server.address().port}`);
});
