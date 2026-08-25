import { useState } from "react";
import iconLogo from "../../assets/images/icon.png";
import {
  LegalModal,
  PrivacyPolicyContent,
  TermsOfServiceContent,
  SecurityStandardsContent,
} from "./LegalModal";

type ModalType = "privacy" | "terms" | "security" | null;

export function InstitutionalFooter() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <>
      <footer className="border-t border-slate-100 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Legal Links */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
            <button
              onClick={() => setActiveModal("privacy")}
              className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
            >
              Políticas de Privacidade
            </button>
            <button
              onClick={() => setActiveModal("terms")}
              className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
            >
              Termos de Serviço
            </button>
            <button
              onClick={() => setActiveModal("security")}
              className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
            >
              Padrões de Segurança
            </button>
          </div>

          {/* Main Footer */}
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-2">
              <img
                src={iconLogo}
                alt="PocketMed"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-sm font-bold text-slate-700">
                Pocket<span className="text-primary">Med</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400">
              &copy; {new Date().getFullYear()} PocketMed Clínical Systems.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LegalModal
        open={activeModal === "privacy"}
        onClose={() => setActiveModal(null)}
        title="Política de Privacidade"
      >
        <PrivacyPolicyContent />
      </LegalModal>

      <LegalModal
        open={activeModal === "terms"}
        onClose={() => setActiveModal(null)}
        title="Termos de Serviço"
      >
        <TermsOfServiceContent />
      </LegalModal>

      <LegalModal
        open={activeModal === "security"}
        onClose={() => setActiveModal(null)}
        title="Padrões de Segurança"
      >
        <SecurityStandardsContent />
      </LegalModal>
    </>
  );
}
