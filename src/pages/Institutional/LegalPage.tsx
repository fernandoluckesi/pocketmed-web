import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { InstitutionalHeader } from "./InstitutionalHeader";
import {
  SkipToContent,
  MAIN_CONTENT_ID,
} from "../../components/SkipToContent";
import { InstitutionalFooter } from "./InstitutionalFooter";
import { TermsOfServiceContent, PrivacyPolicyContent } from "./LegalModal";
import { SEO } from "../../components/SEO";
import { PUBLIC_PAGES } from "../../constants/seo";

const SEO_PAGE = PUBLIC_PAGES.find((p) => p.path === "/termos")!;

/**
 * Single, responsive page showing both the Terms of Use and the Privacy Policy.
 * Linked directly from the mobile app (Sobre / Login / Criar conta) and from
 * the institutional footer. Reuses the same content blocks as the LegalModal.
 */
export default function LegalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Canonical is /termos even when this renders at /legal or
          /privacidade. Those aliases exist because the mobile app and the
          app-store listings link to them; without this they would be three
          URLs serving identical content, which is duplicate content. */}
      <SEO
        title={SEO_PAGE.title}
        description={SEO_PAGE.description}
        canonical={SEO_PAGE.path}
        type="article"
      />

      <SkipToContent />
      <InstitutionalHeader />

      <main id={MAIN_CONTENT_ID} className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar ao início
        </Link>

        <h1 className="text-2xl sm:text-2xl font-extrabold text-slate-900 mb-2">
          Termos de Uso e Política de Privacidade
        </h1>
        <p className="text-sm text-slate-500 mb-8 sm:mb-10">
          Leia com atenção os termos que regem o uso do Hispora e como tratamos
          os seus dados.
        </p>

        {/* Terms of Use */}
        <section id="termos" className="scroll-mt-24">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4">
            Termos de Uso
          </h2>
          <article className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
            <TermsOfServiceContent />
          </article>
        </section>

        <hr className="my-10 sm:my-12 border-slate-100" />

        {/* Privacy Policy */}
        <section id="privacidade" className="scroll-mt-24">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4">
            Política de Privacidade
          </h2>
          <article className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
            <PrivacyPolicyContent />
          </article>
        </section>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
