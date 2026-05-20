import {
  BadgeCheck,
  Mail,
  Phone,
  ChevronRight,
  Stethoscope,
  Users,
  Star,
  GraduationCap,
  Award,
  Clock,
  ArrowRight,
  MoreVertical,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/MainLayout";

// --- Data ---

const stats = [
  {
    icon: Stethoscope,
    label: "Total de Consultas",
    value: "1,240",
    trend: "+12% MoM",
    trendColor: "text-emerald-600 bg-emerald-50",
    iconColor: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    label: "Pacientes Ativos",
    value: "450",
    trend: "+5 novos",
    trendColor: "text-emerald-600 bg-emerald-50",
    iconColor: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: Star,
    label: "Satisfação dos Pacientes",
    value: "4.9",
    subValue: "/ 5.0",
    trend: "Top 5% Clínica",
    trendColor: "text-on-surface-variant bg-surface-container",
    iconColor: "bg-amber-100 text-amber-600",
  },
];

const patients = [
  { id: "JD", name: "James Davenport", date: "24 Out, 2023", status: "Em Tratamento", statusType: "primary" },
  { id: "EL", name: "Elena Linski", date: "22 Out, 2023", status: "Concluído", statusType: "muted" },
  { id: "MR", name: "Marcus Reed", date: "21 Out, 2023", status: "Retorno Urgente", statusType: "urgent" },
  { id: "SW", name: "Sarah Wallace", date: "19 Out, 2023", status: "Em Tratamento", statusType: "primary" },
];

// --- Components ---

function DoctorHeader() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col md:flex-row gap-8 items-start mb-8">
      <div className="relative group">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-48 h-48 rounded-full overflow-hidden bg-surface-container-high ring-4 ring-primary-container/10 relative"
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkiuKdYY6-ZggXIv5EW_29BvkwzzkMv8W-0cnb5j2v0QpjrjVb4yvK6RB-JDQzXjIFV1vmuwuJSOBcdOm6Z8dShHEzlY147z0fzpFpRO3JgBo0EDfGJ4gCodni5BnsDr9iF1XQY8RbXO9cIFIO3_44BwTVQvJ1j3SXKN2gy6cx2Gsy759Je8FzWhSy5Op4_lAG-rM8WbL2k3yQMIOARRk52wYvOYDVTzmF-_5cWl9vZaSa0jlo3cq079ZxisF2JWiA8Utg6thPSvLR"
            alt="Dr. Roberto Silva"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <div className="absolute bottom-4 right-2 bg-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-surface-container z-10">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Disponível</span>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <nav className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
          <span
            onClick={() => navigate("/doctors")}
            className="hover:text-primary cursor-pointer transition-colors"
          >
            Médicos
          </span>
          <ChevronRight className="w-4 h-4" />
          <span className="font-semibold text-on-surface">Detalhes do Médico</span>
        </nav>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-extrabold text-on-surface tracking-tight"
          >
            Dr. Roberto Silva
          </motion.h1>

          <div className="flex flex-wrap items-center gap-4 mt-3">
            <span className="px-4 py-1 bg-primary text-white rounded-full text-sm font-semibold">
              Cardiologia
            </span>
            <span className="text-on-surface-variant flex items-center gap-1.5 font-medium text-sm">
              <BadgeCheck className="w-4 h-4 text-primary" />
              CRM: 123456-SP
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-8 pt-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Foco Clínico</p>
            <p className="text-on-surface font-medium max-w-xs leading-relaxed">
              Insuficiência Cardíaca Avançada & Imagem Cardiovascular.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Contato Direto</p>
            <div className="flex gap-4">
              <a
                href="mailto:roberto.silva@pocketmed.com"
                className="text-primary hover:underline flex items-center gap-1.5 text-sm font-medium transition-all"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
              <a
                href="tel:+5511987654321"
                className="text-primary hover:underline flex items-center gap-1.5 text-sm font-medium transition-all"
              >
                <Phone className="w-4 h-4" />
                +55 (11) 98765-4321
              </a>
            </div>
          </div>
        </div>

        {/* View Full Profile Button */}
        <div className="pt-2">
          <button
            onClick={() => navigate("/doctors/1/profile")}
            className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all cursor-pointer border-none bg-transparent"
          >
            <ExternalLink size={16} />
            Ver Perfil Completo
          </button>
        </div>
      </div>
    </section>
  );
}

function StatsGrid() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:border-primary/10 transition-all group hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${stat.iconColor} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className={`${stat.trendColor} px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider`}>
              {stat.trend}
            </span>
          </div>
          <p className="text-on-surface-variant text-sm font-medium">{stat.label}</p>
          <h3 className="text-3xl font-display font-extrabold mt-1 text-on-surface">
            {stat.value}
            {stat.subValue && <span className="text-base text-on-surface-variant font-medium ml-1">{stat.subValue}</span>}
          </h3>
        </motion.div>
      ))}
    </section>
  );
}

function PatientsTable() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
      <div className="p-6 flex justify-between items-center border-b border-surface-container">
        <h2 className="text-xl font-display font-extrabold text-on-surface">Pacientes Recentes</h2>
        <button className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer border-none bg-transparent">
          Ver Todos <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Paciente</th>
              <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Última Visita</th>
              <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {patients.map((patient, index) => (
              <motion.tr
                key={patient.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="hover:bg-surface-container-low/30 transition-colors group"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      index % 2 === 0 ? "bg-primary/10 text-primary" : "bg-indigo-100 text-indigo-600"
                    }`}>
                      {patient.id}
                    </div>
                    <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">{patient.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">{patient.date}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    patient.statusType === "primary" ? "bg-primary/10 text-primary" :
                    patient.statusType === "urgent" ? "bg-rose-50 text-rose-600" :
                    "bg-surface-variant text-on-surface-variant"
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container cursor-pointer border-none bg-transparent">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QualificationsCard() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-surface-container-high/40 p-6 rounded-2xl space-y-6 border border-surface-container"
      >
        <h3 className="text-lg font-display font-extrabold text-on-surface">Qualificações</h3>

        <div className="space-y-5">
          <div className="flex gap-4 group">
            <div className="p-2 bg-white rounded-xl shadow-sm text-primary group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">PhD em Cardiologia</p>
              <p className="text-xs text-on-surface-variant">Johns Hopkins University</p>
            </div>
          </div>

          <div className="flex gap-4 group">
            <div className="p-2 bg-white rounded-xl shadow-sm text-primary group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Board Certified</p>
              <p className="text-xs text-on-surface-variant">American Heart Association</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-outline-variant/20">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-on-surface-variant" />
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Horário de Atendimento</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant font-medium">Seg - Sex</span>
              <span className="font-bold text-on-surface">08:00 - 18:00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant font-medium">Sábado</span>
              <span className="font-bold text-on-surface">09:00 - 13:00</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-primary text-white p-7 rounded-2xl shadow-xl shadow-primary/20 space-y-4 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <Stethoscope className="w-24 h-24 rotate-12" />
        </div>

        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">Auditoria Clínica</p>
          <h4 className="text-2xl font-display font-bold leading-tight">Pronto para nova atribuição de paciente?</h4>
          <p className="text-xs opacity-70 mt-2 mb-6">Otimize seus fluxos clínicos com nossas ferramentas automatizadas.</p>
          <button className="w-full bg-white text-primary font-bold py-3 rounded-full hover:bg-slate-100 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm shadow-lg shadow-black/5 cursor-pointer border-none">
            Gerenciar Agenda
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Main Page ---

export default function DoctorClinicView() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/doctors")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={20} />
          <span>Voltar para Médicos</span>
        </button>

        <DoctorHeader />
        <StatsGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PatientsTable />
          </div>
          <aside className="lg:col-span-1">
            <QualificationsCard />
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
