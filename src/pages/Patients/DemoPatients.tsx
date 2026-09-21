import { ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { DEMO_PATIENT_ID, demoPatientRecord } from "../../mocks/demoPatientApi";

/**
 * Shown instead of the real Patients tabs while the doctor's professional
 * verification is not yet APPROVED. Lets them get a feel for the patient
 * area with a single, clearly-labeled fictitious patient — no real API calls.
 */
export function DemoPatients() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 flex items-center gap-4 border bg-amber-50 border-amber-200"
      >
        <div className="p-2.5 rounded-xl shrink-0 bg-amber-100">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-900">
            Modo demonstração, dados fictícios
          </p>
          <p className="text-xs text-amber-700">
            Finalize a verificação profissional para pesquisar e gerenciar
            pacientes reais. Enquanto isso, veja como é a área de pacientes
            com um exemplo simulado.
          </p>
        </div>
        <Button
          onClick={() => navigate("/verification")}
          variant="primary"
          size="sm"
          className="shrink-0 shadow-none cursor-pointer bg-amber-600 hover:bg-amber-700"
        >
          Completar Verificação
        </Button>
      </motion.div>

      <section className="space-y-4">
        <div>
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            Exemplo
          </p>
          <h4 className="text-2xl font-black font-display tracking-tight text-gray-900">
            Assim fica a área de um paciente
          </h4>
        </div>

        <Link
          to={`/patients/${DEMO_PATIENT_ID}`}
          className="block max-w-md bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft hover:shadow-xl transition-all no-underline text-inherit group"
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 border border-gray-200 shrink-0 flex items-center justify-center text-primary font-bold text-lg">
              {demoPatientRecord.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors font-display truncate">
                {demoPatientRecord.name}
              </h5>
              <p className="text-gray-500 text-sm font-medium truncate">
                {demoPatientRecord.email}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700">
              <Sparkles size={12} />
              Simulado
            </span>
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 group-hover:text-primary transition-colors">
              Ver prontuário de exemplo
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}
