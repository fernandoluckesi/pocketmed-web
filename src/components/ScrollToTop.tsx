import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Resets the scroll position to the top whenever the route changes.
 *
 * The browser only restores scroll automatically for real document
 * navigations. In a SPA, React Router swaps the component tree while the
 * document — and therefore the scroll offset — stays put, so navigating from
 * the bottom of a long page landed the user mid-content on the next screen.
 *
 * Scrolls the window (not a container) because `MainLayout` has no scrollable
 * wrapper: the sidebar is `fixed` and `<main>` uses `min-h-screen` without
 * `overflow`, so the document itself is what scrolls.
 *
 * Three cases are handled deliberately:
 *
 *  1. **Back/forward** — `navigationType === "POP"` is skipped so the browser
 *     can restore where the user was. Forcing the top on a back navigation is
 *     its own UX bug: someone scrolling a long patient list, opening a
 *     record, then going back expects to return to the same spot.
 *
 *  2. **Anchor links** — when the URL carries a `#hash` the target element
 *     wins. `/legal#privacidade` is linked from the footer and from the
 *     mobile app, and jumping to the top would silently break it.
 *
 *  3. **Query-string-only changes** — the effect keys on `pathname`, not on
 *     the whole location, so switching a tab or a filter that lives in the
 *     query string doesn't yank the user back to the top.
 *
 * Renders nothing; mounted once inside the router.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  // Last path we acted on. Kept in a ref because the effect depends on
  // `navigationType` too, and that value flips from POP to PUSH on a
  // query-string-only navigation — which would otherwise re-run the effect
  // and scroll the user away while they were just switching a tab or filter.
  // Comparing the pathname explicitly makes "same screen, different query"
  // a no-op regardless of what re-triggered the effect.
  const lastPathname = useRef(pathname);

  useEffect(() => {
    const pathChanged = lastPathname.current !== pathname;
    lastPathname.current = pathname;

    // Let the browser handle history navigation (case 1).
    if (navigationType === "POP") return;

    // Honour in-page anchors (case 2) — including a hash change within the
    // same page, which is exactly what `/legal#termos` → `/legal#privacidade`
    // does from the footer.
    if (hash) {
      // The target may not be mounted on the first paint after a route
      // change; falling through to the top is the safe default then.
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView();
        return;
      }
    }

    // Same screen, only the query string moved (case 3).
    if (!pathChanged) return;

    // `instant` rather than `smooth`: a route change should feel like a new
    // page, not like the old one gliding away. Smooth scrolling here also
    // animates while the new screen is already rendering, which reads as a
    // glitch on long pages.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, navigationType]);

  return null;
}
