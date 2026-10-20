import { useEffect, useRef, type RefObject } from "react";

/**
 * Closes a dropdown/popover reliably on an outside click, while `active` is
 * true. Listens on the capture phase, not bubble: some ancestor between the
 * click target and `document` may call stopPropagation() during the bubble
 * phase (e.g. a parent's own click-away handler), which would stop a
 * bubble-phase listener here from ever running. Capture-phase listeners run
 * top-down, before any bubble-phase stopPropagation call gets a chance to
 * fire, so this closes reliably regardless of what else is on the page.
 *
 * The listener itself is only (re)attached when `active` changes, not on
 * every render — `onOutside` is read through a ref kept fresh on every
 * render, so callers can pass an inline closure without it going stale or
 * re-subscribing the listener each time.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  active: boolean,
) {
  const onOutsideRef = useRef(onOutside);
  useEffect(() => {
    onOutsideRef.current = onOutside;
  });

  useEffect(() => {
    if (!active) return;

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideRef.current();
      }
    }
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
