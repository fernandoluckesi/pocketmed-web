import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkipToContent, MAIN_CONTENT_ID } from "../../components/SkipToContent";

/**
 * The skip link is the last open item of the accessibility audit (item 8).
 *
 * Its whole value is being reachable by Tab while invisible to everyone
 * else, so the two things worth asserting are exactly that: it IS in the
 * tab order, and it is NOT visible until focused. A `display: none`
 * implementation would look identical in a screenshot and be completely
 * useless, because it would also drop out of the tab order.
 */
describe("SkipToContent", () => {
  it("points at the main-content landmark", () => {
    render(<SkipToContent />);
    expect(
      screen
        .getByRole("link", { name: /conteúdo principal/i })
        .getAttribute("href"),
    ).toBe(`#${MAIN_CONTENT_ID}`);
  });

  it("is the first element reached by Tab", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SkipToContent />
        <a href="/outra">outro link</a>
      </>,
    );

    await user.tab();

    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: /conteúdo principal/i }),
    );
  });

  it("stays in the accessibility tree rather than being display:none", () => {
    // `sr-only` clips the element to 1x1 but keeps it rendered and
    // focusable. `hidden`/`display:none` would remove it from the tab
    // order, defeating the point.
    render(<SkipToContent />);
    const link = screen.getByRole("link", { name: /conteúdo principal/i });

    expect(link.className).toContain("sr-only");
    expect(link.className).toContain("focus:not-sr-only");
    expect(link.hasAttribute("hidden")).toBe(false);
  });

  it("exports the id the pages must put on <main>", () => {
    // Shared constant rather than a string literal in nine places: a typo
    // on one page would make the link a dead anchor there only.
    expect(MAIN_CONTENT_ID).toBe("conteudo-principal");
  });
});
