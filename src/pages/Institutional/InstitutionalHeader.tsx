import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import iconLogo from "../../assets/images/icon.png";

interface InstitutionalHeaderProps {
  currentPage?: "home" | "mobile" | "platform";
}

export function InstitutionalHeader({ currentPage }: InstitutionalHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/institutional" className="flex items-center gap-2.5">
          <img src={iconLogo} alt="PocketMed" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
          <span className="text-lg sm:text-xl font-extrabold text-slate-900">
            Pocket<span className="text-primary">Med</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {currentPage !== "home" && (
            <Link to="/institutional" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Inicio
            </Link>
          )}
          {currentPage !== "mobile" && (
            <Link to="/institutional/mobile" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              App Mobile
            </Link>
          )}
          {currentPage !== "platform" && (
            <Link to="/institutional/platform" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Plataforma Web
            </Link>
          )}
          <Link to="/login" className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
            Acessar
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
        >
          {menuOpen ? <X size={24} className="text-slate-700" /> : <Menu size={24} className="text-slate-700" />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2">
          {currentPage !== "home" && (
            <Link
              to="/institutional"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Inicio
            </Link>
          )}
          {currentPage !== "mobile" && (
            <Link
              to="/institutional/mobile"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              App Mobile
            </Link>
          )}
          {currentPage !== "platform" && (
            <Link
              to="/institutional/platform"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Plataforma Web
            </Link>
          )}
          <div className="pt-2 flex gap-3">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-bold text-slate-700 border border-slate-200"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-bold bg-primary text-white"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
