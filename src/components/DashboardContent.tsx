import { ICONS, IMAGES } from "../constants";
import { motion } from "motion/react";

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
      className="p-8 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Bento Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          variants={itemVariants}
          className="md:col-span-2 bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl shadow-xl shadow-primary/10 flex flex-col justify-between overflow-hidden relative group"
        >
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-semibold font-inter">
              Total Patients Managed
            </p>
            <h3 className="text-4xl font-extrabold text-white mt-2 tracking-tight font-manrope">
              1,284
            </h3>
            <div className="flex items-center mt-4 space-x-2 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <ICONS.TrendingUp size={14} className="text-white" />
              <span className="text-white text-xs font-bold">
                +12% this month
              </span>
            </div>
          </div>
          <ICONS.Patients
            size={120}
            className="absolute -right-6 -bottom-6 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700"
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-4">
              <ICONS.Schedule size={24} />
            </div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">
              Appointments Today
            </p>
            <h3 className="text-3xl font-bold text-on-surface mt-1 font-manrope">
              18
            </h3>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-6">
            <div className="bg-primary h-full w-2/3"></div>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2 font-medium">
            12 completed of 18 total
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-4">
              <span className="text-xl font-bold font-manrope">!</span>
            </div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">
              Urgent Reviews
            </p>
            <h3 className="text-3xl font-bold text-on-surface mt-1 font-manrope">
              3
            </h3>
          </div>
          <button className="mt-4 text-xs font-bold text-orange-600 flex items-center hover:translate-x-1 transition-transform">
            VIEW TASKS <ICONS.ChevronRight size={14} className="ml-1" />
          </button>
        </motion.div>
      </div>

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
                LIVE
              </span>
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
                  status: "Waiting",
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
              View All Today
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
                Schedule for the next 30 days
              </p>
            </div>
            <button className="p-2 rounded-full hover:bg-slate-50 transition-colors text-on-surface-variant">
              <ICONS.Filter size={18} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">
                Monday, Oct 24
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
                    <span className="mx-2 text-slate-300">•</span> Cardiogram
                    Test
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">
                Wednesday, Oct 26
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
                Friday, Oct 28
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
                    <span className="mx-2 text-slate-300">•</span> Consultation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Clinical Performance Insights */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between border border-white"
      >
        <div className="max-w-md text-center md:text-left">
          <h4 className="text-2xl font-black text-on-surface mb-2 tracking-tighter font-manrope">
            Clinical Performance Insights
          </h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Your clinic's patient retention has increased by 15% this quarter.
            Explore the new analytics module to see detailed demographics and
            health outcome trends.
          </p>
          <button className="mt-6 px-6 py-3 bg-on-surface text-white rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-transform">
            Explore Reports
          </button>
        </div>
        <div className="mt-8 md:mt-0 flex -space-x-4">
          <img
            alt="Doctor"
            className="w-16 h-16 rounded-full border-4 border-white object-cover"
            src={IMAGES.Doctor1}
          />
          <img
            alt="Doctor"
            className="w-16 h-16 rounded-full border-4 border-white object-cover"
            src={IMAGES.Doctor2}
          />
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center border-4 border-white text-white text-xs font-bold shadow-lg">
            +5
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
