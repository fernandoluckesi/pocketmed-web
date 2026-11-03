/** The id every public page's `<main>` must carry. */
export const MAIN_CONTENT_ID = "conteudo-principal";

/**
 * "Skip to content" link — the first focusable element on the page.
 *
 * Without it, a keyboard or screen-reader user has to tab through the whole
 * header and navigation on every page before reaching the content. On the
 * institutional pages that is the logo plus four nav links, repeated on
 * each navigation.
 *
 * It is visually hidden until focused, which is the conventional pattern:
 * `sr-only` keeps it out of the visual design, and `focus:not-sr-only`
 * makes it appear the moment someone tabs to it. Hiding it with
 * `display: none` would NOT work — that removes it from the tab order too,
 * which is the one thing it exists for.
 *
 * Closes the last open item of the accessibility audit (item 8).
 *
 * @see archives/docs/legal/features-legal.md — item 8
 */
export function SkipToContent() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
    >
      Ir para o conteúdo principal
    </a>
  );
}
