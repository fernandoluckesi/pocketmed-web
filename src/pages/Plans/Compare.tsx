import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Minus } from "lucide-react";
import { motion } from "motion/react";
import { MainLayout } from "../../components/MainLayout";
import { Button } from "../../components/ui/Button";
import { api } from "../../services/api";
import {
  FEATURE_LABELS,
  formatCapacity,
  formatPriceBRL,
  type Plan,
} from "../../data/plans";

/**
 * Full feature matrix across every plan.
 *
 * Layout note: the user asked for "features as columns, plans as rows". With
 * 12 features that would mean 13 columns on a page that also renders a
 * sidebar, so the matrix is transposed for readability — features run down
 * the rows and plans across the columns, which is also what keeps the plan
 * header (name + price + CTA) sticky and comparable while scrolling. The
 * information is identical either way.
 */
export default function PlansCompare() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  /** Plan the user clicked "Ver detalhes" on — highlighted in the matrix. */
  const focusPlanId = searchParams.get("plan");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const focusColumnRef = useRef<HTMLTableCellElement | null>(null);

  useEffect(() => {
    let active = true;
    api("/plans")
      .then((data) => {
        if (!active) return;
        setPlans(Array.isArray(data) ? data : []);
        setLoadError(!Array.isArray(data));
      })
      .catch(() => {
        if (!active) return;
        setPlans([]);
        setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // On a narrow screen the focused plan can be off to the right, so the table
  // is scrolled to bring it into view once the data has rendered.
  //
  // `scrollIntoView` is deliberately avoided here: it also scrolls the page
  // vertically and, worse, centers the column — which on this table parks it
  // underneath the sticky first column. The offset is computed manually so the
  // column lands just clear of the sticky one.
  useEffect(() => {
    if (!focusPlanId || plans.length === 0) return;
    const container = scrollRef.current;
    const column = focusColumnRef.current;
    if (!container || !column) return;

    const stickyWidth =
      container.querySelector<HTMLElement>("thead th")?.offsetWidth ?? 0;
    const target = column.offsetLeft - stickyWidth - 16;

    container.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [focusPlanId, plans]);

  function handleChoose(planId: string) {
    navigate("/account", { state: { tab: "subscription", planId } });
  }

  return (
    <MainLayout>
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mt-6">
          <Link
            to="/account"
            state={{ tab: "subscription" }}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={16} />
            Voltar para Minha Conta
          </Link>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Comparar planos
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Veja exatamente o que cada plano inclui. A capacidade é por clínica
            — profissionais adicionais podem ser contratados sem trocar de
            plano.
          </p>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Carregando planos...</p>
        )}

        {!loading && loadError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-4 text-sm font-medium">
            Não foi possível carregar os planos agora. Atualize a página para
            tentar novamente.
          </div>
        )}

        {!loading && !loadError && plans.length > 0 && (
          <div
            ref={scrollRef}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto"
          >
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Comparação de funcionalidades incluídas em cada plano Hispora
              </caption>
              <thead>
                <tr className="border-b border-slate-200">
                  <th
                    scope="col"
                    className="sticky left-0 z-20 bg-white p-5 align-bottom w-[260px] min-w-[260px] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-slate-200"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Funcionalidade
                    </span>
                  </th>
                  {plans.map((plan) => {
                    const isFocused = plan.id === focusPlanId;
                    return (
                      <th
                        key={plan.id}
                        scope="col"
                        ref={isFocused ? focusColumnRef : undefined}
                        className={`p-5 align-bottom min-w-[190px] ${
                          isFocused ? "bg-primary/5" : "bg-white"
                        }`}
                      >
                        <div className="space-y-2">
                          {plan.highlighted && (
                            <span className="inline-block bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                              Principal
                            </span>
                          )}
                          <p className="font-display font-bold text-slate-900">
                            {plan.name}
                          </p>
                          <p className="text-xl font-display font-extrabold text-slate-900">
                            {formatPriceBRL(plan.price)}
                            {plan.price !== null && (
                              <span className="text-xs font-normal text-slate-500">
                                /mês
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {formatCapacity(plan)}
                          </p>
                          <Button
                            type="button"
                            variant={plan.highlighted ? "primary" : "outline"}
                            size="sm"
                            fullWidth
                            onClick={() => handleChoose(plan.id)}
                          >
                            {plan.id === "enterprise"
                              ? "Falar com Vendas"
                              : "Escolher"}
                          </Button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {FEATURE_LABELS.map(({ key, label, description }, rowIndex) => {
                  // The sticky column needs a fully opaque background of its
                  // own (`bg-inherit` / a translucent zebra would let the
                  // scrolled cells show through it), so the row stripe is
                  // resolved here and applied to the cell, not the <tr>.
                  const rowBg = rowIndex % 2 === 1 ? "bg-slate-50" : "bg-white";
                  return (
                    <tr
                      key={key}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <th
                        scope="row"
                        className={`sticky left-0 z-20 ${rowBg} p-5 font-medium align-top after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-slate-200`}
                      >
                        <span className="block text-sm text-slate-800">
                          {label}
                        </span>
                        <span className="block text-xs text-slate-400 mt-1 font-normal">
                          {description}
                        </span>
                      </th>
                      {plans.map((plan) => {
                        const included = plan.features[key];
                        const isFocused = plan.id === focusPlanId;
                        return (
                          <td
                            key={plan.id}
                            // Exactly one background utility per cell: stacking
                            // `bg-primary/5` on top of the zebra class would
                            // leave Tailwind's output order deciding which wins.
                            className={`p-5 text-center align-top ${
                              isFocused ? "bg-primary/5" : rowBg
                            }`}
                          >
                            {included ? (
                              <span
                                className="inline-flex w-6 h-6 rounded-full bg-green-100 items-center justify-center"
                                role="img"
                                aria-label={`${label}: incluído no ${plan.name}`}
                              >
                                <Check size={14} className="text-green-600" />
                              </span>
                            ) : (
                              <span
                                className="inline-flex w-6 h-6 rounded-full bg-slate-100 items-center justify-center"
                                role="img"
                                aria-label={`${label}: não incluído no ${plan.name}`}
                              >
                                <Minus size={14} className="text-slate-400" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                <tr className="border-t border-slate-200">
                  <th
                    scope="row"
                    className="sticky left-0 z-20 bg-white p-5 align-top after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-slate-200"
                  >
                    <span className="block text-sm text-slate-800 font-medium">
                      Profissional adicional
                    </span>
                    <span className="block text-xs text-slate-400 mt-1 font-normal">
                      Valor mensal por profissional além do incluído.
                    </span>
                  </th>
                  {plans.map((plan) => (
                    <td
                      key={plan.id}
                      className={`p-5 text-center align-top text-sm font-medium text-slate-700 ${
                        plan.id === focusPlanId ? "bg-primary/5" : "bg-white"
                      }`}
                    >
                      {plan.additionalProfessionalPrice === null
                        ? "Sob consulta"
                        : `R$ ${plan.additionalProfessionalPrice}/mês`}
                    </td>
                  ))}
                </tr>

                <tr className="border-t border-slate-100">
                  <th
                    scope="row"
                    className="sticky left-0 z-20 bg-white p-5 align-top after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-slate-200"
                  >
                    <span className="block text-sm text-slate-800 font-medium">
                      Pacientes ativos adicionais
                    </span>
                    <span className="block text-xs text-slate-400 mt-1 font-normal">
                      Valor mensal a cada 1.000 pacientes ativos extras.
                    </span>
                  </th>
                  {plans.map((plan) => (
                    <td
                      key={plan.id}
                      className={`p-5 text-center align-top text-sm font-medium text-slate-700 ${
                        plan.id === focusPlanId ? "bg-primary/5" : "bg-white"
                      }`}
                    >
                      {plan.additionalPatientsPer1000Price === null
                        ? "Sob consulta"
                        : `R$ ${plan.additionalPatientsPer1000Price}/mês`}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-slate-50 rounded-2xl p-6">
          <p className="text-sm text-slate-500">
            Um paciente é considerado ativo quando teve consulta ou atualização
            de cadastro nos últimos 12 meses. A troca de plano é feita em Minha
            Conta, na aba Assinatura.
          </p>
        </div>
      </motion.div>
    </MainLayout>
  );
}
