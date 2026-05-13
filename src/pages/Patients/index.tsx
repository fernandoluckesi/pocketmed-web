import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Stethoscope,
  CalendarDays,
  HeartPulse,
  UserCircle,
  CreditCard,
  LogOut,
  Search,
  Bell,
  Settings,
  Plus,
  MapPin,
  Activity,
  Pill,
  ArrowRight,
  Info,
  LayoutGrid,
  List,
  LayoutDashboard,
  Eye,
  X,
  Trash2,
  History,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---

interface Patient {
  id: string;
  name: string;
  patientId: string;
  image: string;
  status: "Prioritário" | "Rotina" | "Pós-Op";
  location: string;
  distance: string;
  lastConsultation: string;
  conditions: string[];
}

interface Request {
  id: string;
  date: string;
  time: string;
  patient: string;
  initials: string;
  status: "Pendente" | "Aprovado" | "Recusado";
}

type TabType = "Meus Pacientes" | "Pesquisar Pacientes" | "Solicitações";

// --- Mock Data ---

const PATIENTS: Patient[] = [
  {
    id: "1",
    name: "Helena S. Ferreira",
    patientId: "#PK-9920",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlH5qCW5lmO9HabW1jj6kPe5PIpkHasWbvyJaiXq8QeKYRpa-7dZTFXcscdPXjd6ZDdFG39H2T4R2mz6F3fsbSw0FvTn5zoUyQUheKmXBdvrR0ZtGUW7rTWer4ZCqAeo5sYnt9r7COBDTDTNRYU5Lynng_HZlB7a3zw5R-vuKbY4OJ08wIZLXxQC9f4Mx4K-xTx8eRvA4NZZPEQke4yis341LMDnzckJNDorQEs7qo9jwUTVGcCHcsLqkkdryYZc3HlN93SAFXJxGP",
    status: "Prioritário",
    location: "São Paulo, SP",
    distance: "2.4km",
    lastConsultation: "15 Out 2023",
    conditions: ["Hipertensão", "Diabetes Tipo 2"],
  },
  {
    id: "2",
    name: "Roberto Alcântara",
    patientId: "#PK-8841",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVNPUgwiMvHkkEM59m_0fbcbfJg5AHKCJcZBeFRw8hBrWj1fCKFJO8j_LuVpNeqL7imv_eHaSYIPS0rLT1wuzQvEqSJNZLvaKvdU0beKJ7KERCTEBawSng4mmSYb1LWFNzyRaCBaS4X_wLdlFqN7FPbCldW0qvGJAEAZ7EoRQFtAULFWWKYKlstkz2vhdS78FOY1sIW0AGuWjOiwJYn_wHIc7PvbXAh0dHcw2iFdON31jEPAQPocgvi6KK6fIv__5ThaYaQeTdIViI",
    status: "Rotina",
    location: "Campinas, SP",
    distance: "98km",
    lastConsultation: "Sem registros recentes",
    conditions: ["Check-up Geral"],
  },
  {
    id: "3",
    name: "Lucas Mendes",
    patientId: "#PK-7712",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkpVgyNgZcFpQWg4GYULvjwYRGutWwrXkiQVgm0ufCSSibckAIfYp8H7LllJBnK_GCYaRjL5Rxo19n7Vqyou_IrXDTfCZId7TS7hE9mkXe7eBr73D4W1n_f2zivmzNGK50pHXnURpD7M-bWK8_1W7ilrXwyDjjEdkT9F7c5L87Uz2WqqAmaZoTXJTZLoHlM-joUgHwJXoYIJvanD3zT4jBh9x8GMJsGYsTBC7249xcsZKwpnOfVPJEaI-wKnfnO9LQv0C1nNijVy0A",
    status: "Pós-Op",
    location: "São Paulo, SP",
    distance: "0.8km",
    lastConsultation: "Ontem",
    conditions: ["Recuperação de Joelho"],
  },
];

const REQUESTS: Request[] = [
  {
    id: "1",
    date: "12 Mai 2024",
    time: "14:30",
    patient: "João Silva Santos",
    initials: "JS",
    status: "Pendente",
  },
  {
    id: "2",
    date: "10 Mai 2024",
    time: "09:15",
    patient: "Maria Oliveira",
    initials: "MO",
    status: "Aprovado",
  },
  {
    id: "3",
    date: "08 Mai 2024",
    time: "16:45",
    patient: "Ricardo Costa",
    initials: "RC",
    status: "Recusado",
  },
  {
    id: "4",
    date: "05 Mai 2024",
    time: "11:00",
    patient: "Ana Lúcia Ferreira",
    initials: "AL",
    status: "Pendente",
  },
];

const statusStyles = {
  Pendente: "bg-amber-100 text-amber-700",
  Aprovado: "bg-green-100 text-green-700",
  Recusado: "bg-red-100 text-red-700",
};

const statusDots = {
  Pendente: "bg-amber-500",
  Aprovado: "bg-green-500",
  Recusado: "bg-red-500",
};

// --- Sidebar & TopBar ---

const SidebarItem = ({
  icon: Icon,
  label,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
}) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 rounded-full transition-all duration-200 group ${active ? "bg-white shadow-sm text-primary font-bold" : "text-gray-500 hover:text-primary hover:bg-gray-100"}`}
    >
      <Icon
        className={`mr-3 w-5 h-5 ${active ? "fill-primary" : "group-hover:fill-primary/20"}`}
      />
      <span className="font-display text-sm tracking-tight">{label}</span>
    </Link>
  );
};

const PatientsSidebar = () => (
  <aside className="fixed left-0 top-0 h-screen w-64 bg-[#f1f3f5] border-r border-gray-200 p-6 flex flex-col space-y-8 z-50">
    <div className="flex items-center space-x-3 group cursor-pointer">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
        <HeartPulse className="w-6 h-6 fill-white" />
      </div>
      <div>
        <h1 className="text-xl font-black text-primary leading-none font-display">
          PocketMed
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#747687]">
          Clinical Excellence
        </p>
      </div>
    </div>
    <nav className="flex-1 space-y-1">
      <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
      <SidebarItem icon={Users} label="Patients" to="/patients" />
      <SidebarItem icon={Stethoscope} label="Doctors" to="/doctors" />
      <SidebarItem icon={CalendarDays} label="Schedule" to="/schedule" />
      <SidebarItem
        icon={HeartPulse}
        label="Clinical Management"
        to="/clinical-management"
      />
      <div className="pt-4 mt-4 border-t border-gray-200">
        <SidebarItem icon={UserCircle} label="My Account" to="/account" />
        <SidebarItem icon={CreditCard} label="Plans" to="/plans" />
      </div>
    </nav>
    <div className="mt-auto">
      <button className="w-full flex items-center px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all font-display text-sm font-semibold group">
        <LogOut className="mr-3 w-5 h-5 group-hover:rotate-180 transition-transform" />
        Logout
      </button>
    </div>
  </aside>
);

const PatientsTopBar = () => (
  <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 flex justify-between items-center px-8 py-4">
    <div className="flex items-center gap-4">
      <span className="text-2xl font-extrabold text-primary font-display tracking-tighter">
        PocketMed
      </span>
      <nav className="hidden md:flex ml-8 space-x-2">
        {["Home", "Pacientes", "Agenda"].map((item) => (
          <a
            key={item}
            href="#"
            className={`px-4 py-1.5 rounded-lg text-lg font-medium font-display tracking-tight transition-colors ${item === "Pacientes" ? "text-primary font-bold bg-primary/5" : "text-gray-500 hover:bg-gray-50"}`}
          >
            {item}
          </a>
        ))}
      </nav>
    </div>
    <div className="flex items-center gap-4">
      <div className="relative hidden lg:block group">
        <input
          type="text"
          placeholder="Pesquisar..."
          className="bg-gray-100 border-none rounded-full px-6 py-2 w-64 focus:ring-2 focus:ring-primary/40 text-sm tonal-shift"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary" />
      </div>
      <div className="flex gap-1">
        {[Bell, Settings].map((Icon, i) => (
          <button
            key={i}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors relative"
          >
            <Icon className="w-5 h-5" />
            {i === 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
        ))}
      </div>
      <div className="w-9 h-9 rounded-full bg-blue-100 overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwgVMqvfl1-ERzdaASfoagg2ImZFT00_OFANLk2uyWItyYVUqiAJBnu3y62zB2BrlD2HvtJdJDst6LMfK2y85PB4twOo7ZLKaE-X2XdQZeOB5Ms7zoJXq10GXG5BobD31n_o_gO3dU3nYi_2kSObKO9UgFMMP0coo5U-ULGUnv0ul3SKR8Wi6UX1EQ3KabF4PpvYMV68VE2ekg32Gv_R3eZCHDGoAPftRQBeN_tStAIx5E9rj2tJzJgfHK0i6Cpnmh_Qs5HLqjMYCg"
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </header>
);

// --- Search Tab Components ---

const SearchHero = () => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-[#2b5aed] p-12 text-white shadow-2xl shadow-primary/20"
  >
    <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[80px]" />
    <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
      <div className="space-y-4">
        <h3 className="text-4xl lg:text-5xl font-black font-display tracking-tighter">
          Encontre Novos Pacientes
        </h3>
        <p className="text-white/80 text-lg font-medium max-w-xl mx-auto leading-relaxed">
          Pesquise na base global do PocketMed por localização, especialidade ou
          necessidades clínicas específicas.
        </p>
      </div>
      <div className="glass p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl">
        <div className="flex-1 relative flex items-center">
          <Users className="absolute left-4 w-5 h-5 text-white/60" />
          <input
            type="text"
            placeholder="Nome ou ID do paciente..."
            className="w-full bg-transparent border-none focus:ring-0 pl-12 py-4 text-white placeholder:text-white/60 text-lg"
          />
        </div>
        <div className="h-10 w-px bg-white/20 self-center hidden md:block" />
        <div className="flex-1 relative flex items-center">
          <MapPin className="absolute left-4 w-5 h-5 text-white/60" />
          <select className="w-full bg-transparent border-none focus:ring-0 pl-12 py-4 text-white appearance-none cursor-pointer text-lg">
            <option className="text-gray-900">Todas as Cidades</option>
            <option className="text-gray-900">São Paulo, SP</option>
            <option className="text-gray-900">Rio de Janeiro, RJ</option>
          </select>
        </div>
        <button className="bg-white text-primary px-10 py-4 rounded-xl font-bold hover:bg-white/90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-black/10">
          <Search className="w-5 h-5" />
          Pesquisar
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="text-sm font-semibold text-white/60 self-center mr-2">
          Filtros rápidos:
        </span>
        {["Cardiologia", "Pediatria", "Pré-operatório"].map((tag) => (
          <button
            key={tag}
            className="px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold hover:bg-white/10 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  </motion.section>
);

const PatientCard = ({ patient }: { patient: Patient }) => (
  <motion.div
    whileHover={{ y: -8 }}
    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft hover:shadow-xl transition-all flex flex-col justify-between group"
  >
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
          <img
            src={patient.image}
            alt={patient.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h5 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors font-display truncate">
            {patient.name}
          </h5>
          <p className="text-gray-500 text-sm font-medium truncate">
            {patient.id + " \u2022 " + patient.patientId}
          </p>
        </div>
      </div>
    </div>
    <div className="space-y-3 mb-8">
      <div className="flex items-center text-sm text-gray-600 font-medium">
        <MapPin className="w-4 h-4 mr-2.5 text-gray-400 shrink-0" />
        <span className="truncate">
          {patient.location} ({patient.distance})
        </span>
      </div>
      <div className="flex items-center text-sm text-gray-600 font-medium">
        <Activity className="w-4 h-4 mr-2.5 text-gray-400 shrink-0" />
        <span className="truncate">
          Última consulta: {patient.lastConsultation}
        </span>
      </div>
      <div className="flex items-center text-sm text-gray-600 font-medium">
        <Pill className="w-4 h-4 mr-2.5 text-gray-400 shrink-0" />
        <span className="truncate">{patient.conditions.join(", ")}</span>
      </div>
    </div>
    <button className="w-full py-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 text-gray-700">
      Solicitar Acesso <ArrowRight className="w-5 h-5" />
    </button>
  </motion.div>
);

const PatientListRow = ({
  patient,
  index,
}: {
  patient: Patient;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -2 }}
    className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group"
  >
    <div className="flex items-center gap-5 flex-1 min-w-0">
      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 group-hover:border-primary/20 transition-colors">
        <img
          src={patient.image}
          alt={patient.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <h5 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate font-display">
          {patient.name}
        </h5>
        <p className="text-slate-400 text-sm font-semibold">
          {patient.patientId}
        </p>
      </div>
    </div>

    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 flex-[2] w-full">
      <div className="flex items-center text-sm text-slate-500 font-medium">
        <MapPin className="w-4 h-4 mr-2 text-primary shrink-0" />
        <span className="truncate">
          {patient.location} ({patient.distance})
        </span>
      </div>
      <div className="flex items-center text-sm text-slate-500 font-medium">
        <Activity className="w-4 h-4 mr-2 text-primary shrink-0" />
        <span className="truncate">
          Última consulta: {patient.lastConsultation}
        </span>
      </div>
    </div>

    <div className="shrink-0 w-full md:w-auto">
      <button className="w-full md:w-auto px-6 py-3 bg-blue-50 text-primary hover:bg-primary hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 group/btn">
        Solicitar Acesso
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  </motion.div>
);

// --- Solicitações Tab Components ---

function RequestsTable() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-100 transition-all duration-300">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="font-display font-bold text-xl text-on-surface">
            Histórico de Solicitações
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Gerencie as permissões de acesso aos prontuários dos pacientes.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:brightness-110 shadow-md shadow-primary/20 transition-all"
        >
          <Plus size={18} strokeWidth={3} />
          Nova Solicitação
        </motion.button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display">
                Data da Solicitação
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display">
                Nome do Paciente
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display text-center">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {REQUESTS.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-on-surface">
                      {req.date}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {req.time}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                      {req.initials}
                    </div>
                    <span className="text-sm font-medium text-on-surface">
                      {req.patient}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 flex justify-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold gap-2 ${statusStyles[req.status]}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusDots[req.status]}`}
                    ></span>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <button
                      className="p-2 text-on-surface-variant hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                      title="Visualizar"
                    >
                      <Eye size={18} />
                    </button>
                    {req.status === "Recusado" ? (
                      <button
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                        title="Histórico"
                      >
                        <History size={18} />
                      </button>
                    ) : req.id === "2" ? (
                      <button
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                        title="Cancelar"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-6 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
          Mostrando 4 de 24 solicitações
        </span>
        <div className="flex gap-2">
          <button
            className="p-2 rounded-lg border border-slate-200 hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            disabled
          >
            <ChevronLeft size={18} />
          </button>
          <button className="p-2 rounded-lg border border-slate-200 hover:bg-white transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-blue-50/60 p-6 rounded-2xl border border-blue-100/50 flex items-center gap-4 group hover:bg-blue-50 transition-colors">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 transition-transform group-hover:scale-110">
          <Hourglass size={24} fill="currentColor" />
        </div>
        <div>
          <div className="text-2xl font-black text-blue-900">08</div>
          <div className="text-xs font-bold uppercase text-blue-700/70 tracking-tight">
            Aguardando Resposta
          </div>
        </div>
      </div>
      <div className="bg-green-50/60 p-6 rounded-2xl border border-green-100/50 flex items-center gap-4 group hover:bg-green-50 transition-colors">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200 transition-transform group-hover:scale-110">
          <CheckCircle size={24} fill="currentColor" />
        </div>
        <div>
          <div className="text-2xl font-black text-green-900">142</div>
          <div className="text-xs font-bold uppercase text-green-700/70 tracking-tight">
            Acessos Ativos
          </div>
        </div>
      </div>
      <div className="bg-orange-50/60 p-6 rounded-2xl border border-orange-100/50 flex items-center gap-4 group hover:bg-orange-50 transition-colors">
        <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-200 transition-transform group-hover:scale-110">
          <Info size={24} fill="currentColor" />
        </div>
        <div>
          <div className="text-xs font-bold text-orange-900 leading-tight">
            Privacidade & Dados
          </div>
          <p className="text-[10px] font-medium text-orange-800/80 mt-1 leading-relaxed">
            Todas as solicitações seguem as diretrizes da LGPD e protocolos de
            segurança hospitalar.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Tab Content Components ---

function SearchTabContent({
  view,
  setView,
}: {
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
}) {
  return (
    <>
      <SearchHero />
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
              Resultados da Busca
            </p>
            <h4 className="text-3xl font-black font-display tracking-tight">
              12 Pacientes Encontrados
            </h4>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-primary"}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-primary"}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
        <motion.div
          layout
          className={
            view === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              : "space-y-4"
          }
        >
          <AnimatePresence>
            {PATIENTS.map((patient, idx) =>
              view === "grid" ? (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <PatientCard patient={patient} />
                </motion.div>
              ) : (
                <PatientListRow
                  key={patient.id}
                  patient={patient}
                  index={idx}
                />
              ),
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 shadow-soft border border-gray-100"
        >
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0">
            <Info className="w-10 h-10 fill-primary/10" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h6 className="text-2xl font-bold font-display">
              Não encontrou quem procurava?
            </h6>
            <p className="text-gray-500 font-medium max-w-2xl text-lg">
              Refine seus termos de busca ou utilize o número do CPF para uma
              pesquisa direta e precisa no banco de dados nacional do PocketMed.
            </p>
          </div>
          <button className="md:ml-auto bg-[#334380] text-white px-8 py-4 rounded-2xl font-bold hover:brightness-110 transition-all whitespace-nowrap shadow-lg shadow-blue-900/10 active:scale-95">
            Suporte ao Médico
          </button>
        </motion.div>
      </section>
    </>
  );
}

function SolicitacoesTabContent() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <RequestsTable />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <StatsSection />
      </motion.div>
    </div>
  );
}

// --- Main Page Component ---

export default function Patients() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<TabType>("Pesquisar Pacientes");

  const tabs: TabType[] = [
    "Meus Pacientes",
    "Pesquisar Pacientes",
    "Solicitações",
  ];

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/10">
      <PatientsSidebar />

      <main className="ml-64 min-h-screen">
        <PatientsTopBar />

        <div className="max-w-7xl mx-auto p-10 space-y-12">
          {/* Header Action */}
          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <h2 className="text-4xl font-extrabold font-display tracking-tight text-gray-900 leading-none">
                  Gestão de Pacientes
                </h2>
                <p className="text-gray-500 font-medium">
                  Pesquise e gerencie sua base de pacientes global.
                </p>
              </div>
              <button className="bg-primary text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5" />
                Adicionar Paciente
              </button>
            </div>

            <div className="flex space-x-1 p-1 bg-white rounded-2xl w-fit shadow-sm border border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    tab === activeTab
                      ? "bg-primary/5 text-primary"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "Pesquisar Pacientes" && (
            <SearchTabContent view={view} setView={setView} />
          )}
          {activeTab === "Solicitações" && <SolicitacoesTabContent />}
          {activeTab === "Meus Pacientes" && (
            <SearchTabContent view={view} setView={setView} />
          )}
        </div>
      </main>
    </div>
  );
}
