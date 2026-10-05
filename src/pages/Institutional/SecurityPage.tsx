import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { InstitutionalHeader } from "./InstitutionalHeader";
import { InstitutionalFooter } from "./InstitutionalFooter";
import { SecurityStandardsContent } from "./LegalModal";

/**
 * Standalone page for the Security Standards. The footer previously opened
 * this content in a modal only — a modal has no URL, so it couldn't be linked
 * from the app stores, shared, or indexed. Reuses the same content block as
 * the modal so the two can't drift apart.
 */
export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <InstitutionalHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar ao início
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="text-primary" size={28} />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Padrões de Segurança
          </h1>
        </div>
        <p className="text-sm text-slate-500 mb-8 sm:mb-10">
          Como protegemos os seus dados de saúde no Hispora.
        </p>

        <article className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
          <SecurityStandardsContent />
        </article>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
