import { ICONS, IMAGES } from "../constants";
import { motion } from "motion/react";
import { PromoBanner } from "./PromoBanner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const DashboardContent = () => {
  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Promo Banner Carousel */}
      <PromoBanner />

      {/* Main Content: Side-by-Side Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Consultas de Hoje */}
        <motion.section
          variants={itemVariants}
          className="bg-slate-50 rounded-xl p-1 shadow-sm border border-slate-100"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-on-surface tracking-tight font-manrope">
                Consultas de Hoje
              </h2>
              <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded">
                AO VIVO
              </span>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl p-4 mb-6">
              <h3 className="text-3xl font-bold text-on-surface font-manrope">
                18
              </h3>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-4">
                <div className="bg-primary h-full w-2/3"></div>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-2 font-medium">
                12 concluídas de 18 total
              </p>
            </div>
            <div className="space-y-3">
              {[
                {
                  time: "09:00",
                  period: "AM",
                  name: "Ana Clara Oliveira",
                  type: "Check-up Pós-Operatório",
                },
                {
                  time: "10:30",
                  period: "AM",
                  name: "Roberto Santos",
                  type: "Consulta de Rotina - Cardio",
                },
                {
                  time: "11:15",
                  period: "NOW",
                  name: "Maria Heloísa Silva",
                  type: "Análise de Exames",
                  status: "Aguardando",
                  active: true,
                },
                {
                  time: "14:00",
                  period: "PM",
                  name: "Carlos Eduardo Lima",
                  type: "Primeira Consulta",
                },
                {
                  time: "15:30",
                  period: "PM",
                  name: "Beatriz Mendes",
                  type: "Retorno",
                },
              ].map((apt, idx) => (
                <div
                  key={idx}
                  className={`flex items-center p-4 rounded-xl transition-all group cursor-pointer ${
                    apt.active
                      ? "bg-white ring-2 ring-primary/40 shadow-lg relative"
                      : "bg-white hover:shadow-md"
                  }`}
                >
                  {apt.active && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-full"></div>
                  )}
                  <div className="w-16 flex-shrink-0 text-center border-r border-slate-100 mr-4">
                    <p className="text-xs font-black text-primary">
                      {apt.time}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium">
                      {apt.period}
                    </p>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-on-surface">
                      {apt.name}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {apt.type}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {apt.status && (
                      <span className="bg-blue-50 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                        {apt.status}
                      </span>
                    )}
                    <div
                      className={`${apt.active ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
                    >
                      <ICONS.ChevronRight size={14} className="text-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-full bg-white text-primary font-bold text-xs hover:bg-primary hover:text-white transition-colors uppercase tracking-widest border border-slate-100">
              Ver Todas de Hoje
            </button>
          </div>
        </motion.section>

        {/* Próximas Consultas */}
        <motion.section
          variants={itemVariants}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-extrabold text-on-surface tracking-tight font-manrope">
                Próximas Consultas
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                Agenda para os próximos 30 dias
              </p>
            </div>
            <button className="p-2 rounded-full hover:bg-slate-50 transition-colors text-on-surface-variant">
              <ICONS.Filter size={18} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">
                Segunda, 24 Out
              </p>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  JD
                </div>
                <div className="flex-grow pt-0.5">
                  <p className="text-sm font-bold text-on-surface">
                    Juliana Drummond
                  </p>
                  <div className="flex items-center text-[10px] text-on-surface-variant mt-1">
                    <ICONS.Clock size={12} className="mr-1" /> 08:30 AM
                    <span className="mx-2 text-slate-300">•</span> Teste de
                    Cardiograma
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">
                Quarta, 26 Out
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    alt="Patient"
                    className="w-10 h-10 rounded-full object-cover"
                    src={IMAGES.PatientFernanda}
                  />
                  <div className="flex-grow pt-0.5">
                    <p className="text-sm font-bold text-on-surface">
                      Fernanda Lima
                    </p>
                    <div className="flex items-center text-[10px] text-on-surface-variant mt-1">
                      <ICONS.Clock size={12} className="mr-1" /> 14:00 PM
                      <span className="mx-2 text-slate-300">•</span> Annual
                      Review
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                    PA
                  </div>
                  <div className="flex-grow pt-0.5">
                    <p className="text-sm font-bold text-on-surface">
                      Paulo Albuquerque
                    </p>
                    <div className="flex items-center text-[10px] text-on-surface-variant mt-1">
                      <ICONS.Clock size={12} className="mr-1" /> 16:45 PM
                      <span className="mx-2 text-slate-300">•</span> Blood
                      Pressure Monitoring
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">
                Sexta, 28 Out
              </p>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 text-on-surface flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  MT
                </div>
                <div className="flex-grow pt-0.5">
                  <p className="text-sm font-bold text-on-surface">
                    Marcos Teodoro
                  </p>
                  <div className="flex items-center text-[10px] text-on-surface-variant mt-1">
                    <ICONS.Clock size={12} className="mr-1" /> 10:00 AM
                    <span className="mx-2 text-slate-300">•</span> Consulta
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

    </motion.div>
  );
};
