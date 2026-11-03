import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoHorizontal from "../../assets/logos/hispora-horizontal-primary.png";

interface InstitutionalHeaderProps {
  currentPage?: "home" | "mobile" | "platform";
}

export function InstitutionalHeader({ currentPage }: InstitutionalHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src={logoHorizontal}
            alt="Hispora"
            width={1718}
            height={600}
            className="h-16 sm:h-[4.5rem] w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {currentPage !== "home" && (
            <Link
              to="/"
              className="inline-flex items-center py-3.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              Início
            </Link>
          )}
          {currentPage !== "mobile" && (
            <Link
              to="/institutional/mobile"
              className="inline-flex items-center py-3.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              Para Pacientes
            </Link>
          )}
          {currentPage !== "platform" && (
            <Link
              to="/institutional/platform"
              className="inline-flex items-center py-3.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              Para Médicos
            </Link>
          )}
          <Link
            to="/login"
            className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors"
          >
            Acessar
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          /* min-h/min-w 44px: WCAG 2.5.8 minimum touch target. At `p-2`
             around a 24px icon this rendered 40x40 on mobile — the one
             real (non-inline-text) control under the threshold. */
          className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
        >
          {menuOpen ? (
            <X size={24} className="text-slate-700" />
          ) : (
            <Menu size={24} className="text-slate-700" />
          )}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2">
          {currentPage !== "home" && (
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Início
            </Link>
          )}
          {currentPage !== "mobile" && (
            <Link
              to="/institutional/mobile"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Para Pacientes
            </Link>
          )}
          {currentPage !== "platform" && (
            <Link
              to="/institutional/platform"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Para Médicos
            </Link>
          )}
          <div className="pt-2 flex gap-3">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-bold text-slate-700 border border-slate-200 cursor-pointer"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-bold bg-primary text-white cursor-pointer"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
