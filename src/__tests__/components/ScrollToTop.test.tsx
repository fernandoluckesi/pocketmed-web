import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ScrollToTop } from "../../components/ScrollToTop";

/**
 * Covers the SPA scroll-reset behaviour.
 *
 * The bug being fixed: React Router swaps the component tree without touching
 * the document, so navigating from the bottom of a long page landed the user
 * mid-content on the next screen.
 *
 * The valuable half of this suite is the exceptions, not the happy path. A
 * naive `window.scrollTo(0, 0)` on every location change fixes the reported
 * bug and quietly introduces three others: it breaks the browser's back
 * button, breaks `/legal#privacidade` anchor links, and yanks the page on
 * query-string-only changes (tabs, filters). Each has a test.
 *
 * Note on the harness: a router's FIRST render always reports a `POP`
 * navigation type, both in `MemoryRouter` and on a real page load. That is
 * why every assertion below is made after an explicit `navigate()` rather
 * than on mount — and it is also the correct production behaviour, since a
 * fresh page load should leave scroll restoration to the browser.
 */

/** Navigates to `to` when the button is clicked, so each test can assert on
 * a real route transition instead of the initial mount. */
function Harness({ to }: { to: string }) {
  const navigate = useNavigate();
  return (
    <>
      <ScrollToTop />
      <button onClick={() => navigate(to)}>go</button>
      <Routes>
        <Route path="/a" element={<div>page a</div>} />
        <Route path="/b" element={<div>page b</div>} />
        <Route path="/legal" element={<div>legal</div>} />
        <Route path="*" element={<div>home</div>} />
      </Routes>
    </>
  );
}

describe("ScrollToTop", () => {
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function renderAndNavigate(from: string, to: string) {
    const utils = render(
      <MemoryRouter initialEntries={[from]}>
        <Harness to={to} />
      </MemoryRouter>,
    );
    scrollTo.mockClear(); // discard anything from the initial mount
    act(() => {
      utils.getByText("go").click();
    });
    return utils;
  }

  it("scrolls to the top on a forward navigation", () => {
    renderAndNavigate("/a", "/b");

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, left: 0 }),
    );
  });

  it("scrolls instantly rather than smoothly", () => {
    // A route change should read as a new page, not as the old one gliding
    // away while the next screen is already painting.
    renderAndNavigate("/a", "/b");

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
  });

  it("does not scroll on the initial render", () => {
    // First render is a POP: on a real page load the browser already handles
    // scroll restoration, so stepping on it would break reload-into-anchor
    // and refresh-keeps-position.
    render(
      <MemoryRouter initialEntries={["/a"]}>
        <ScrollToTop />
      </MemoryRouter>,
    );

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("does NOT scroll on back/forward navigation", () => {
    // Forcing the top on a back navigation is its own UX bug: scrolling a
    // long patient list, opening a record, then going back must return the
    // user to where they were.
    const { getByText } = render(
      <MemoryRouter initialEntries={["/a", "/b"]} initialIndex={1}>
        <Harness to="/a" />
      </MemoryRouter>,
    );

    scrollTo.mockClear();
    act(() => {
      window.history.back();
    });

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("honours an anchor in the URL instead of jumping to the top", () => {
    // `/legal#privacidade` is linked from the institutional footer and from
    // the mobile app; resetting to the top would silently break it.
    const target = document.createElement("div");
    target.id = "privacidade";
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    renderAndNavigate("/a", "/legal#privacidade");

    expect(scrollIntoView).toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();

    document.body.removeChild(target);
  });

  it("falls back to the top when the anchor target does not exist", () => {
    // A stale or mistyped hash must not leave the user stranded mid-page.
    renderAndNavigate("/a", "/legal#does-not-exist");

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it("does not scroll when only the query string changes", () => {
    // Tabs and filters live in the query string (e.g. the data-deletion page
    // uses `?tipo=dados`); re-scrolling on those would fight the user.
    renderAndNavigate("/a?tab=one", "/a?tab=two");

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("renders nothing", () => {
    const { container } = render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
