import {
  Users,
  ShieldCheck,
  Stethoscope,
  MapPin,
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { MainLayout } from "../../components/MainLayout";

// --- Types ---

interface Member {
  id: string;
  name: string;
  email: string;
  role: "Administrador" | "Médico";
  initials: string;
  bgColor: string;
  textColor: string;
}

interface LinkedPatient {
  id: string;
  name: string;
  email: string;
  linkedDoctors: Array<{
    initials: string;
    name: string;
    color: string;
  }>;
}

// --- Mock Data ---

const MEMBERS: Member[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@pocketmed.com",
    role: "Administrador",
    initials: "JD",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    id: "2",
    name: "Sarah Miller",
    email: "sarah.miller@pocketmed.com",
    role: "Médico",
    initials: "SM",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
  {
    id: "3",
    name: "Robert King",
    email: "robert.king@pocketmed.com",
    role: "Médico",
    initials: "RK",
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
  },
];

const PATIENTS: LinkedPatient[] = [
  {
    id: "1",
    name: "Alice Thompson",
    email: "alice.t@email.com",
    linkedDoctors: [
      { initials: "SM", name: "Sarah Miller", color: "bg-blue-500" },
      { initials: "RK", name: "Robert King", color: "bg-emerald-500" },
    ],
  },
  {
    id: "2",
    name: "Mark Stevenson",
    email: "mark.steve@email.com",
    linkedDoctors: [
      { initials: "SM", name: "Sarah Miller", color: "bg-blue-500" },
    ],
  },
];

// --- Components ---

function StatsGrid() {
  const cards = [
    {
      label: "Total de Membros",
      value: 4,
      change: "+12%",
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Administradores",
      value: 1,
      icon: ShieldCheck,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Médicos",
      value: 2,
      icon: Stethoscope,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Pacientes Vinculados",
      value: 2,
      icon: MapPin,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-primary/20 transition-all flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span
              className={`p-3 ${card.bgColor} ${card.iconColor} rounded-lg`}
            >
              <card.icon className="w-6 h-6" />
            </span>
            {card.change && (
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {card.change}
              </span>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold font-display text-slate-900">
              {card.value}
            </h3>
            <p className="text-slate-500 font-medium text-sm">{card.label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function MembersSection() {
  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">
            Membros ativos da clínica
          </h2>
          <p className="text-sm text-slate-500">
            Gerencie funções e permissões de acesso da equipe
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 min-w-[280px] outline-none"
              placeholder="Pesquisar membros..."
            />
          </div>
          <select className="bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-600 py-2.5 px-4 focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none">
            <option>Perfil: Todos</option>
            <option>Administrador</option>
            <option>Médico</option>
          </select>
          <button className="bg-primary hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer border-none">
            <UserPlus className="w-4 h-4" />
            <span>Adicionar Membro</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Nome
              </th>
              <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Email
              </th>
              <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Perfil
              </th>
              <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MEMBERS.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${member.bgColor} flex items-center justify-center ${member.textColor} font-bold text-xs`}
                    >
                      {member.initials}
                    </div>
                    <span className="font-semibold text-slate-900">
                      {member.name}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">
                  {member.email}
                </td>
                <td className="px-8 py-5">
                  <select
                    className="bg-slate-100 border-none text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-primary/20 cursor-pointer outline-none"
                    defaultValue={member.role}
                  >
                    <option>Administrador</option>
                    <option>Médico</option>
                  </select>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer">
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-6 bg-slate-50/30 flex items-center justify-between border-t border-slate-100">
        <p className="text-sm text-slate-500 font-medium">
          Exibindo{" "}
          <span className="font-bold text-slate-900">{MEMBERS.length}</span> de{" "}
          <span className="font-bold text-slate-900">4</span> membros
        </p>
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-30"
            disabled
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm">
            Página 1 de 1
          </div>
          <button
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-30"
            disabled
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function LinkedPatientsSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="px-8 py-6 border-b border-slate-100">
        <h2 className="text-xl font-bold font-display text-slate-900">
          Pacientes vinculados aos médicos da clínica
        </h2>
        <p className="text-sm text-slate-500">
          Mapeamento em tempo real das associações médico-paciente
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Paciente
              </th>
              <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Email
              </th>
              <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Médicos Vinculados
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PATIENTS.map((patient) => (
              <tr
                key={patient.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-8 py-5">
                  <span className="font-semibold text-slate-900">
                    {patient.name}
                  </span>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">
                  {patient.email}
                </td>
                <td className="px-8 py-5">
                  <div className="flex -space-x-2">
                    {patient.linkedDoctors.map((doc, idx) => (
                      <div
                        key={idx}
                        className={`w-8 h-8 rounded-full border-2 border-white ${doc.color} flex items-center justify-center text-[10px] text-white font-bold cursor-help`}
                        title={doc.name}
                      >
                        {doc.initials}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SidePanel() {
  return (
    <div className="space-y-6">
      {/* Clinic Performance */}
      <div className="bg-gradient-to-br from-primary to-blue-400 p-6 rounded-xl shadow-lg text-white">
        <h3 className="font-bold font-display mb-2">Desempenho da Clínica</h3>
        <p className="text-white/80 text-sm mb-4">
          Sua clínica está operando com eficiência máxima. 98% de satisfação dos
          pacientes registrada este mês.
        </p>
        <div className="w-full bg-white/20 rounded-full h-2 mb-2">
          <motion.div
            className="bg-white h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "85%" }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
          Capacidade: 85% ocupada
        </span>
      </div>

      {/* Urgent Attention Alert */}
      <div className="bg-orange-50 p-6 rounded-xl shadow-sm border border-orange-200/50">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-orange-700 w-5 h-5" />
          <h3 className="font-bold font-display text-orange-900">
            Atenção Urgente
          </h3>
        </div>
        <p className="text-orange-800 text-sm font-medium">
          2 solicitações de verificação de membros pendentes requerem aprovação
          do administrador.
        </p>
        <button className="mt-4 w-full bg-orange-700 text-white py-2 rounded-lg font-bold text-xs hover:bg-orange-800 transition-colors cursor-pointer border-none">
          Revisar Solicitações
        </button>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function ClinicalManagement() {
  return (
    <MainLayout>
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page Title */}
        <div>
          <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Gestão da Clínica
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Gerencie membros, permissões e pacientes vinculados.
          </p>
        </div>

        {/* Stats Grid */}
        <StatsGrid />

        {/* Members Table */}
        <MembersSection />

        {/* Linked Patients + Side Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <LinkedPatientsSection />
          </div>
          <div className="lg:col-span-1">
            <SidePanel />
          </div>
        </section>
      </motion.div>
    </MainLayout>
  );
}
