import { useState } from "react";
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

// --- Components ---

const SidebarItem = ({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) => (
  <a
    href="#"
    className={`flex items-center px-4 py-3 rounded-full transition-all duration-200 group ${
      active
        ? "bg-white shadow-sm text-primary font-bold"
        : "text-gray-500 hover:text-primary hover:bg-gray-100"
    }`}
  >
    <Icon
      className={`mr-3 w-5 h-5 ${active ? "fill-primary" : "group-hover:fill-primary/20"}`}
    />
    <span className="font-display text-sm tracking-tight">{label}</span>
  </a>
);

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
      <SidebarItem icon={LayoutDashboard} label="Dashboard" />
      <SidebarItem icon={Users} label="Patients" active />
      <SidebarItem icon={Stethoscope} label="Doctors" />
      <SidebarItem icon={CalendarDays} label="Schedule" />
      <SidebarItem icon={HeartPulse} label="Clinical Management" />

      <div className="pt-4 mt-4 border-t border-gray-200">
        <SidebarItem icon={UserCircle} label="My Account" />
        <SidebarItem icon={CreditCard} label="Plans" />
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
            className={`px-4 py-1.5 rounded-lg text-lg font-medium font-display tracking-tight transition-colors ${
              item === "Pacientes"
                ? "text-primary font-bold bg-primary/5"
                : "text-gray-500 hover:bg-gray-50"
            }`}
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
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          <img
            src={patient.image}
            alt={patient.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h5 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors font-display">
            {patient.name}
          </h5>
          <p className="text-gray-500 text-sm font-medium">
            {patient.id + " • " + patient.patientId}
          </p>
        </div>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
          patient.status === "Prioritário"
            ? "bg-[#ffdbce] text-[#802a00]"
            : patient.status === "Pós-Op"
              ? "bg-[#dde1ff] text-[#334380]"
              : "bg-gray-100 text-gray-600"
        }`}
      >
        {patient.status}
      </span>
    </div>

    <div className="space-y-3 mb-8">
      <div className="flex items-center text-sm text-gray-600 font-medium">
        <MapPin className="w-4 h-4 mr-2.5 text-gray-400" />
        {patient.location} ({patient.distance})
      </div>
      <div className="flex items-center text-sm text-gray-600 font-medium">
        <Activity className="w-4 h-4 mr-2.5 text-gray-400" />
        Última consulta: {patient.lastConsultation}
      </div>
      <div className="flex items-center text-sm text-gray-600 font-medium">
        <Pill className="w-4 h-4 mr-2.5 text-gray-400" />
        {patient.conditions.join(", ")}
      </div>
    </div>

    <button className="w-full py-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 text-gray-700">
      Solicitar Acesso
      <ArrowRight className="w-5 h-5" />
    </button>
  </motion.div>
);

export default function Patients() {
  const [view, setView] = useState<"grid" | "list">("grid");

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
              {["Meus Pacientes", "Pesquisar Pacientes", "Solicitações"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                      tab === "Pesquisar Pacientes"
                        ? "bg-primary/5 text-primary"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>
          </div>

          <SearchHero />

          {/* Results Grid */}
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
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {PATIENTS.map((patient, idx) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <PatientCard patient={patient} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Bottom Support */}
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
                  Refine seus termos de busca ou utilize o número do CPF para
                  uma pesquisa direta e precisa no banco de dados nacional do
                  PocketMed.
                </p>
              </div>
              <button className="md:ml-auto bg-[#334380] text-white px-8 py-4 rounded-2xl font-bold hover:brightness-110 transition-all whitespace-nowrap shadow-lg shadow-blue-900/10 active:scale-95">
                Suporte ao Médico
              </button>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
}
