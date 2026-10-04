import logoHorizontal from "../../assets/logos/hispora-horizontal-primary.png";
import { LegalLinks } from "../../components/LegalLinks";

export function InstitutionalFooter() {
  return (
    <footer className="border-t border-slate-100 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <LegalLinks className="mb-6 sm:mb-8" />

        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center">
            <img src={logoHorizontal} alt="Hispora" className="h-14 w-auto" />
          </div>

          <p className="text-xs sm:text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Hispora Clinical Systems.
          </p>
        </div>
      </div>
    </footer>
  );
}
