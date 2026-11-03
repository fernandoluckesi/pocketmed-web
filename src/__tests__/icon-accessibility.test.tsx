import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Camera, Trash2 } from "lucide-react";

/**
 * Legal audit items 8 and 9 flagged that decorative `lucide-react` icons
 * had no `aria-hidden="true"`, which would make a screen reader announce an
 * element carrying no information.
 *
 * The flag was wrong, and this suite is the evidence. `lucide-react` emits
 * `aria-hidden="true"` by default and only drops it when the icon is given
 * an `aria-*`, `role` or `title` prop — i.e. exactly when the icon IS
 * meaningful. So the audit item needs no code change, and adding the
 * attribute by hand across hundreds of call sites would have been churn.
 *
 * This is pinned as a test rather than written down in the audit document
 * because it is an assumption about a third-party library: if a future
 * version of lucide changes the default, this fails and tells us the
 * hundreds of untouched call sites just became a real accessibility gap.
 */
describe("decorative icons are hidden from assistive technology", () => {
  it("hides a bare icon by default", () => {
    const { container } = render(<Camera size={28} />);
    const svg = container.querySelector("svg");

    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("hides an icon that only carries styling", () => {
    const { container } = render(<Trash2 className="w-4 h-4 text-rose-500" />);

    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("stops hiding the icon once it is given a label", () => {
    // The escape hatch that makes the default safe: an icon that genuinely
    // conveys information (the paperclip marking "has attachment" in the
    // Atestados table) becomes visible to the screen reader by being named.
    const { container } = render(
      <Camera aria-label="Possui anexo" role="img" />,
    );
    const svg = container.querySelector("svg");

    expect(svg?.getAttribute("aria-hidden")).toBeNull();
    expect(svg?.getAttribute("aria-label")).toBe("Possui anexo");
  });
});
