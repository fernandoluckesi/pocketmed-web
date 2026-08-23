import { useState, useEffect, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  Stethoscope,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  X,
  Loader2,
  AlertTriangle,
  Pencil,
  Trash2,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { MainLayout } from "../../components/MainLayout";
import { Tooltip } from "../../components/ui/Tooltip";
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
  isShadow?: boolean;
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
      singular: "Membro",
      plural: "Membros",
      value: overview?.members.total || 0,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      singular: "Administrador",
      plural: "Administradores",
      value: overview?.members.admins || 0,
      icon: ShieldCheck,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      singular: "Médico",
      plural: "Médicos",
      value: overview?.members.doctors || 0,
      icon: Stethoscope,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      singular: "Paciente Vinculado",
      plural: "Pacientes Vinculados",
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
          key={card.singular}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-primary/20 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className={`p-3 ${card.bgColor} ${card.iconColor} rounded-lg`}
            >
              <card.icon className="w-6 h-6" />
            </span>
          </div>
          <p className="text-slate-900 font-display flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">{card.value}</span>
            <span className="text-sm font-medium text-slate-500">
              {card.value === 1 ? card.singular : card.plural}
            </span>
          </p>
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
  onEdit,
  onResendCode,
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
  onEdit: (member: Member) => void;
  onResendCode: (membershipId: string) => void;
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
    secretary: "Secretário(a)",
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
            <option value="secretary">Secretário(a)</option>
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
              <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Status
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
                  colSpan={5}
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
                    <td className="px-8 py-5">
                      {member.role === "admin" ? (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700">Ativo</span>
                      ) : member.isShadow ? (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700">Pendente</span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700">Ativo</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      {member.role !== "admin" && (
                        <div className="flex items-center justify-end gap-1">
                          {member.isShadow && (
                            <Tooltip label="Reenviar código de ativação">
                              <button
                                onClick={() => onResendCode(member.id)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all cursor-pointer border-none bg-transparent"
                              >
                                <Send size={16} />
                              </button>
                            </Tooltip>
                          )}
                          <Tooltip label="Editar">
                            <button
                              onClick={() => onEdit(member)}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary transition-all cursor-pointer border-none bg-transparent"
                            >
                              <Pencil size={16} />
                            </button>
                          </Tooltip>
                          <Tooltip label="Remover">
                            <button
                              onClick={() => onRemove(member.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all cursor-pointer border-none bg-transparent"
                            >
                              <Trash2 size={16} />
                            </button>
                          </Tooltip>
                        </div>
                      )}
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

      // Also fetch secretaries from new table and merge
      let secretaryMembers: Member[] = [];
      if (!roleFilter || roleFilter === "secretary") {
        try {
          const secretaries = await api("/secretaries");
          secretaryMembers = (Array.isArray(secretaries) ? secretaries : []).map((s: any) => ({
            id: s.id,
            role: "secretary",
            isActive: s.isActive,
            isShadow: s.isShadow,
            invitedBy: s.invitedBy,
            createdAt: s.createdAt,
            professional: {
              id: s.id,
              name: s.name,
              email: s.email,
            },
          }));
        } catch {
          // ignore
        }
      }

      // Filter out old secretary members from clinic_memberships to avoid duplicates
      const clinicMembers = data.items.filter(
        (m) => m.role !== "secretary",
      );

      const allMembers = [...clinicMembers, ...secretaryMembers];

      // Apply search filter to secretary members too
      const filtered = search
        ? allMembers.filter((m) => {
            const term = search.toLowerCase();
            return (
              m.professional?.name?.toLowerCase().includes(term) ||
              m.professional?.email?.toLowerCase().includes(term)
            );
          })
        : allMembers;

      setMembers(filtered);
      setTotal(data.total + secretaryMembers.length);
      setTotalPages(Math.max(data.totalPages, 1));
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
    setRemoveTarget(membershipId);
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    try {
      // Try new secretaries endpoint first, fall back to clinic-admin
      try {
        await api(`/secretaries/${removeTarget}`, { method: "DELETE" });
      } catch {
        await api(`/clinic-admin/members/${removeTarget}`, { method: "DELETE" });
      }
      loadMembers();
      loadOverview();
    } catch {
      // ignore
    } finally {
      setRemoveTarget(null);
    }
  };

  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  // --- Add/Edit Member Modal ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setAddForm({
      name: member.professional?.name || "",
      email: member.professional?.email || "",
      phone: "",
    });
    setAddError("");
    setAddSuccess("");
    setShowAddModal(true);
  };

  const handleResendCode = async (membershipId: string) => {
    try {
      await api(`/secretaries/${membershipId}/resend-code`, { method: "POST" });
      alert("Código reenviado com sucesso!");
    } catch {
      alert("Erro ao reenviar código.");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    if (!addForm.name.trim() || !addForm.email.trim() || (!editingMember && !addForm.phone.trim())) {
      setAddError("Preencha todos os campos.");
      return;
    }

    setAddLoading(true);
    try {
      if (editingMember) {
        // Update via PATCH /secretaries/:id
        await api(`/secretaries/${editingMember.id}`, {
          method: "PATCH",
          body: {
            name: addForm.name.trim(),
            email: addForm.email.trim(),
            ...(addForm.phone.trim() ? { phone: addForm.phone.replace(/\D/g, "") } : {}),
          },
        });
        setAddSuccess("Secretário(a) atualizado(a) com sucesso!");
      } else {
        // Create via POST /secretaries
        await api("/secretaries", {
          method: "POST",
          body: {
            name: addForm.name.trim(),
            email: addForm.email.trim(),
            phone: addForm.phone.replace(/\D/g, ""),
          },
        });
        setAddSuccess("Secretário(a) cadastrado(a)! Um código de acesso foi enviado para o email informado.");
      }
      setAddForm({ name: "", email: "", phone: "" });
      setEditingMember(null);
      setShowAddModal(false);
      loadMembers();
      loadOverview();
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("already") || msg.includes("Conflict") || msg.includes("cadastrado")) {
        setAddError("Este email já está cadastrado nesta clínica.");
      } else {
        setAddError(editingMember ? "Erro ao atualizar. Tente novamente." : "Erro ao adicionar. Tente novamente.");
      }
    } finally {
      setAddLoading(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
              Gestão da Clínica
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Gerencie membros, permissões e pacientes vinculados.
            </p>
          </div>
          <button
            onClick={() => { setShowAddModal(true); setAddError(""); setAddSuccess(""); setEditingMember(null); setAddForm({ name: "", email: "", phone: "" }); }}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border-none"
          >
            <UserPlus size={18} />
            Adicionar Secretário(a)
          </button>
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
          onEdit={handleEdit}
          onResendCode={handleResendCode}
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

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">{editingMember ? "Editar Secretário(a)" : "Adicionar Secretário(a)"}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="px-6 py-5 space-y-4">
              {addError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-700">{addError}</p>
                </div>
              )}
              {addSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-emerald-700">{addSuccess}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nome completo</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Nome do secretário(a)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Telefone</label>
                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                    let masked = "";
                    if (digits.length > 0) masked += `(${digits.slice(0, 2)}`;
                    if (digits.length >= 2) masked += `) `;
                    if (digits.length > 2) masked += digits.slice(2, 7);
                    if (digits.length > 7) masked += `-${digits.slice(7, 11)}`;
                    setAddForm({ ...addForm, phone: masked });
                  }}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                />
              </div>
              <p className="text-xs text-slate-500">
                {editingMember ? "Atualize os dados do secretário(a)." : "Um código de primeiro acesso será enviado para o email informado."}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors cursor-pointer border-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {addLoading && <Loader2 size={16} className="animate-spin" />}
                  {addLoading ? "Salvando..." : editingMember ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRemoveTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="text-red-600" size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Remover membro</h3>
            <p className="text-sm text-slate-600 mb-6">
              Tem certeza que deseja remover este membro da clínica? Ele perderá o acesso à plataforma.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemoveTarget(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors cursor-pointer border-none"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors cursor-pointer border-none"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
