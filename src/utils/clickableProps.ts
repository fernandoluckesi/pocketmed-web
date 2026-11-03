import type { KeyboardEvent } from "react";

/**
 * Makes a non-semantic element (`<div>`, `<span>`) behave like a real button
 * for keyboard and screen-reader users.
 *
 * Why this exists: a `<div onClick>` can't be reached with Tab, doesn't react
 * to Enter/Space, and isn't announced as a control — so the action is simply
 * unavailable to anyone not using a mouse. That's an accessibility barrier
 * (and, for a health platform whose users include elderly people and people
 * with disabilities, the LBI — Lei 13.146/2015, art. 63 — makes it a legal
 * one too).
 *
 * **Prefer a real `<button>` whenever possible.** This helper is for the
 * cases where swapping the tag would mean restructuring layout or nesting a
 * button inside another interactive element (which is invalid HTML). Cards
 * that wrap several elements and open a detail view are the typical case.
 *
 * Usage:
 * ```tsx
 * <div {...clickableProps(() => onSelect(item))} className="...">
 * ```
 *
 * Deliberately NOT applied to modal backdrops: a backdrop is a convenience
 * for mouse users, not a control. Making it focusable would insert a
 * meaningless stop in the tab order — the keyboard path out of a dialog is
 * Escape plus the explicit Cancel/Close button.
 */
export function clickableProps(
  onActivate: () => void,
  options: { label?: string; disabled?: boolean } = {},
) {
  const { label, disabled } = options;

  if (disabled) {
    // Keep it out of the tab order and unannounced, mirroring a disabled
    // button rather than a silently inert div.
    return {
      role: "button" as const,
      "aria-disabled": true,
      tabIndex: -1,
    };
  }

  return {
    role: "button" as const,
    tabIndex: 0,
    "aria-label": label,
    onClick: onActivate,
    onKeyDown: (event: KeyboardEvent) => {
      // Only react when this element itself is the one focused. Several of
      // these containers wrap real controls (a calendar day cell wraps the
      // appointment buttons inside it), and keydown bubbles. Without this
      // guard, pressing Enter on a nested button would fire the nested
      // action AND the container's — navigating away from the dialog the
      // nested button just opened. The click path already guards this with
      // stopPropagation on the child; this is the keyboard equivalent.
      if (event.target !== event.currentTarget) return;

      // Native buttons fire on both Enter and Space. Space must also have
      // its default prevented, otherwise the page scrolls underneath.
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate();
      }
    },
  };
}
