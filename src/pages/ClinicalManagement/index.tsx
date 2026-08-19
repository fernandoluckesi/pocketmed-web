import { useState, useEffect, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  Stethoscope,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { MainLayout } from "../../components/MainLayout";
import { api } from "../../services/api";

// --- Types ---

interface Overview {
  clinicId: string;
  clinicName: string | null;
  members: {
    total: number;
    admins: number;
    doctors: number;
    secretaries: number;
  };
  patients: { total: number };
}

interface Member {
  id: string;
  role: string;
  isActive: boolean;
  invitedBy: string | null;
  createdAt: string;
  professional: {
    id: string;
    name: string;
    email: string;
    specialty?: string;
    crm?: string;
    profileImage?: string | null;
  } | null;
}

interface MemberListResponse {
  items: Member[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface LinkedPatient {
  id: string;
  name: string;
  email: string;
  linkedDoctors: Array<{
    id: string;
    name: string;
    email: string;
    specialty: string;
    crm: string;
  }>;
}

// --- Components ---

function StatsGrid({ overview }: { overview: Overview | null }) {
  const cards = [
    {
      label: "Total de Membros",
      value: overview?.members.total || 0,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Administradores",
      value: overview?.members.admins || 0,
      icon: ShieldCheck,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Médicos",
      value: overview?.members.doctors || 0,
      icon: Stethoscope,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Pacientes Vinculados",
      value: overview?.patients.total || 0,
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

function MembersSection({
  members,
  total,
  page,
  totalPages,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onPageChange,
  onRemove,
}: {
  members: Member[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  onSearchChange: (v: string) => void;
  roleFilter: string;
  onRoleFilterChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onRemove: (membershipId: string) => void;
}) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const roleColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: "bg-purple-100", text: "text-purple-700" },
    doctor: { bg: "bg-emerald-100", text: "text-emerald-700" },
    secretary: { bg: "bg-blue-100", text: "text-blue-700" },
  };

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    doctor: "Médico",
    secretary: "Secretária",
  };

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
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 min-w-[280px] outline-none"
              placeholder="Pesquisar membros..."
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-600 py-2.5 px-4 focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
          >
            <option value="">Perfil: Todos</option>
            <option value="admin">Administrador</option>
            <option value="doctor">Médico</option>
            <option value="secretary">Secretária</option>
          </select>
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
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-8 py-12 text-center text-slate-400 text-sm"
                >
                  Nenhum membro encontrado
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const name = member.professional?.name || "—";
                const colors = roleColors[member.role] || {
                  bg: "bg-slate-100",
                  text: "text-slate-700",
                };
                return (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${colors.bg} flex items-center justify-center ${colors.text} font-bold text-xs`}
                        >
                          {getInitials(name)}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500">
                      {member.professional?.email || "—"}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${colors.bg} ${colors.text}`}
                      >
                        {roleLabels[member.role] || member.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => onRemove(member.id)}
                        className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-6 bg-slate-50/30 flex items-center justify-between border-t border-slate-100">
        <p className="text-sm text-slate-500 font-medium">
          Exibindo{" "}
          <span className="font-bold text-slate-900">{members.length}</span> de{" "}
          <span className="font-bold text-slate-900">{total}</span> membros
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-30"
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm">
            Página {page} de {totalPages || 1}
          </div>
          <button
            onClick={() => onPageChange(page + 1)}
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-30"
            disabled={page >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function LinkedPatientsSection({ patients }: { patients: LinkedPatient[] }) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

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
            {patients.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-8 py-12 text-center text-slate-400 text-sm"
                >
                  Nenhum paciente vinculado
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
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
                      {patient.linkedDoctors.map((doc) => (
                        <div
                          key={doc.id}
                          className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold cursor-help"
                          title={doc.name}
                        >
                          {getInitials(doc.name)}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SidePanel({ overview }: { overview: Overview | null }) {
  const totalMembers = overview?.members.total || 0;
  const capacity =
    totalMembers > 0 ? Math.min((totalMembers / 10) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary to-blue-400 p-6 rounded-xl shadow-lg text-white">
        <h3 className="font-bold font-display mb-2">Desempenho da Clínica</h3>
        <p className="text-white/80 text-sm mb-4">
          {overview?.clinicName || "Sua clínica"} está operando com{" "}
          {totalMembers} membros ativos e {overview?.patients.total || 0}{" "}
          pacientes vinculados.
        </p>
        <div className="w-full bg-white/20 rounded-full h-2 mb-2">
          <motion.div
            className="bg-white h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${capacity}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
          Capacidade: {Math.round(capacity)}% ocupada
        </span>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function ClinicalManagement() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [patients, setPatients] = useState<LinkedPatient[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    try {
      const data = await api("/clinic-admin/overview");
      setOverview(data);
    } catch {
      // ignore
    }
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "10");
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);

      const data: MemberListResponse = await api(
        `/clinic-admin/members?${params.toString()}`,
      );
      setMembers(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // ignore
    }
  }, [page, search, roleFilter]);

  const loadPatients = useCallback(async () => {
    try {
      const data = await api("/clinic-admin/patients");
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    Promise.all([loadOverview(), loadMembers(), loadPatients()]).finally(() =>
      setLoading(false),
    );
  }, [loadOverview, loadMembers, loadPatients]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleRemove = async (membershipId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;
    try {
      await api(`/clinic-admin/members/${membershipId}`, { method: "DELETE" });
      loadMembers();
      loadOverview();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Gestão da Clínica
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Gerencie membros, permissões e pacientes vinculados.
          </p>
        </div>

        <StatsGrid overview={overview} />

        <MembersSection
          members={members}
          total={total}
          page={page}
          totalPages={totalPages}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          roleFilter={roleFilter}
          onRoleFilterChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
          onPageChange={setPage}
          onRemove={handleRemove}
        />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <LinkedPatientsSection patients={patients} />
          </div>
          <div className="lg:col-span-1">
            <SidePanel overview={overview} />
          </div>
        </section>
      </motion.div>
    </MainLayout>
  );
}
