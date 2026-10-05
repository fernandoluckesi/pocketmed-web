import { Link } from "react-router-dom";
import { LEGAL_LINKS } from "../constants/legal-links";

/**
 * Renders the shared legal/compliance footer links (see
 * `constants/legal-links.ts` for the list and the reasoning).
 */
interface LegalLinksProps {
  /** `dots` separates items with a bullet (compact auth footers); `spaced`
   * lays them out with gaps (institutional footers). */
  variant?: "dots" | "spaced";
  className?: string;
}

export function LegalLinks({
  variant = "spaced",
  className = "",
}: LegalLinksProps) {
  if (variant === "dots") {
    return (
      <div
        className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${className}`}
      >
        {LEGAL_LINKS.map((link, index) => (
          <span key={link.to} className="flex items-center gap-x-3">
            {index > 0 && (
              <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0" />
            )}
            <Link
              to={link.to}
              className="hover:text-primary transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 ${className}`}
    >
      {LEGAL_LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-primary transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
