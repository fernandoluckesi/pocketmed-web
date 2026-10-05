/**
 * The legal/compliance links shown in the app footers.
 *
 * Kept in one place because the same list appears on the landing page, the
 * institutional footer, Login and Signup — four copies that had already
 * drifted. They point at real pages rather than opening modals: a modal has
 * no URL, so it can't be linked from the app stores (the Play Console
 * requires linkable URLs for the privacy policy and the data-deletion page),
 * shared, bookmarked or indexed.
 *
 * In its own module rather than alongside `LegalLinks` so that file exports
 * only components (fast refresh requirement).
 */
export const LEGAL_LINKS = [
  { to: "/legal#privacidade", label: "Políticas de Privacidade" },
  { to: "/legal#termos", label: "Termos de Serviço" },
  { to: "/seguranca", label: "Padrões de Segurança" },
  { to: "/exclusao-de-dados", label: "Exclusão de Dados" },
] as const;
