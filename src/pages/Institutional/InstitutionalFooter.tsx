import logoHorizontal from "../../assets/logos/hispora-horizontal-primary.png";
import { LegalLinks } from "../../components/LegalLinks";
import { COMPANY, hasCompanyLegalInfo } from "../../constants/company";

export function InstitutionalFooter() {
  return (
    <footer className="border-t border-slate-100 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <LegalLinks className="mb-6 sm:mb-8" />

        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center">
            <img src={logoHorizontal} alt="Hispora" className="h-14 w-auto" />
          </div>

          <div className="text-xs sm:text-sm text-slate-400">
            {/* Company identification (Marco Civil / CDC art. 31). Renders
                only once the legal entity's data exists — see
                constants/company.ts for why a placeholder is not acceptable
                here. Until then the footer keeps the copyright line alone,
                exactly as before. */}
            {hasCompanyLegalInfo && (
              <>
                <p className="font-semibold text-slate-500">
                  {COMPANY.legalName}
                </p>
                <p>CNPJ {COMPANY.cnpj}</p>
                {COMPANY.address && <p>{COMPANY.address}</p>}
              </>
            )}
            {/* Trade name here rather than the hardcoded string: with the
                legal name now rendered just above, repeating the identical
                text twice in the same block reads as a duplication bug. If
                the two names ever diverge, this line follows the brand. */}
            <p className={hasCompanyLegalInfo ? "mt-1" : undefined}>
              &copy; {new Date().getFullYear()} {COMPANY.tradeName}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
