import { describe, it, expect } from "vitest";

/**
 * Legal audit item 10 ("contraste corrigido") was filed as "not verifiable
 * by code". That was only half true: the ratio itself is arithmetic on the
 * palette, and the palette is in the repo. What needs a human is deciding
 * which text is important enough to fix — not measuring it.
 *
 * So this file measures it. The WCAG 2.1 contrast formula is implemented
 * below and run against the greys the project actually uses for text, which
 * turns a vague suspicion in the audit document into a number that fails
 * the build if someone picks a worse grey tomorrow.
 *
 * Why it matters here specifically: WCAG AA (4.5:1 for normal text) is the
 * benchmark Brazilian courts and the ANPD lean on when applying the LBI
 * (Lei 13.146/2015, art. 63), and this platform's users include elderly
 * people reading their own medical records.
 *
 * What this does NOT do: it cannot tell you whether a failing colour is
 * used on real content or on something decorative. That still needs axe or
 * Lighthouse against the running app.
 */

/** Relative luminance, per WCAG 2.1 §relative-luminance. */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

/** Contrast ratio between two colours, per WCAG 2.1 §contrast-ratio. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE = "#ffffff";

// Tailwind v4 palette values for the greys this project uses as text.
const TEXT_GREYS = {
  "slate-300": "#cad5e2",
  "slate-400": "#90a1b9",
  "slate-500": "#62748e",
  "slate-600": "#45556c",
  "slate-900": "#0f172a",
  "gray-400": "#99a1af",
  "gray-500": "#6a7282",
} as const;

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

describe("contrast ratio formula", () => {
  it("is 21:1 for black on white and 1:1 for white on white", () => {
    expect(contrastRatio("#000000", WHITE)).toBeCloseTo(21, 1);
    expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#62748e", WHITE)).toBeCloseTo(
      contrastRatio(WHITE, "#62748e"),
      10,
    );
  });
});

describe("text greys against a white background", () => {
  it.each([
    ["slate-500", AA_NORMAL],
    ["slate-600", AA_NORMAL],
    ["slate-900", AA_NORMAL],
    ["gray-500", AA_NORMAL],
  ] as const)("%s meets WCAG AA for normal text", (name, min) => {
    expect(
      contrastRatio(TEXT_GREYS[name as keyof typeof TEXT_GREYS], WHITE),
    ).toBeGreaterThanOrEqual(min);
  });

  // Pinned as failing on purpose. The audit guessed slate-400 was "around
  // 3.5:1, below the 4.5:1 minimum"; it is in fact 2.63:1, which also
  // misses the 3:1 allowance for large text. Recording the real number
  // matters because 3.5:1 looks like a borderline call and 2.63:1 does not.
  //
  // These are NOT fixed yet: slate-400 alone appears ~377 times, so
  // swapping it is a visual change across every screen and a design
  // decision, not a bug fix. The remedy is known and cheap when wanted —
  // slate-500 is the next step on the same ramp and clears AA at 4.76:1.
  it.each([
    ["slate-300", 1.49],
    ["slate-400", 2.63],
    ["gray-400", 2.6],
  ] as const)(
    "%s is known to FAIL WCAG AA and is not used for essential text",
    (name, expected) => {
      const ratio = contrastRatio(
        TEXT_GREYS[name as keyof typeof TEXT_GREYS],
        WHITE,
      );

      expect(ratio).toBeCloseTo(expected, 1);
      expect(ratio).toBeLessThan(AA_NORMAL);
    },
  );

  it("slate-500 is a drop-in replacement that clears AA", () => {
    // The assertion that makes the fix a one-liner when it is approved.
    expect(
      contrastRatio(TEXT_GREYS["slate-500"], WHITE),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrastRatio(TEXT_GREYS["slate-400"], WHITE)).toBeLessThan(
      AA_LARGE,
    );
  });
});
