/**
 * Scrolls to and focuses the first invalid field inside `formElement`, in
 * document order (top to bottom) — not the order keys happen to appear in
 * Formik's `errors` object, which doesn't necessarily match visual layout.
 *
 * Works for any Formik form without per-field markup: it matches each error
 * key against an element carrying that `name` (every native input Formik
 * drives already has one) or, for custom components that don't expose a
 * real `name` attribute on their visible element (e.g. CustomSelect, whose
 * `name` lives on an invisible `<input type="hidden">`), a `data-field`
 * attribute carrying the same key.
 */
export function scrollToFirstFormError(
  errors: Record<string, unknown>,
  formElement: HTMLElement | null,
): void {
  if (!formElement) return;

  const errorKeys = Object.keys(errors).filter((key) => errors[key]);
  if (errorKeys.length === 0) return;

  const candidates = Array.from(
    formElement.querySelectorAll<HTMLElement>("[name], [data-field]"),
  ).filter((el) => {
    const key = el.getAttribute("name") || el.getAttribute("data-field");
    // A hidden input (e.g. CustomSelect's real form value) has no visual
    // position worth scrolling to — prefer its visible sibling instead,
    // matched via data-field on that visible element.
    return key !== null && errorKeys.includes(key) && el.offsetParent !== null;
  });

  // Document order already reflects visual top-to-bottom order for a normal
  // vertical form layout, so the first match is "the first error".
  const target = candidates[0];
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });
  // preventScroll avoids fighting the smooth scrollIntoView above with the
  // browser's own default "jump to focused element" behavior.
  target.focus?.({ preventScroll: true });
}
