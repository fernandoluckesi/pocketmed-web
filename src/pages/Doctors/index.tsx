import { useState, useEffect, useMemo, useCallback } from "react";
import { PlusCircle, Loader2, UserX, Send, X, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/MainLayout";
import { SearchWithViewToggle } from "../../components/ui/SearchWithViewToggle";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../contexts/ToastContext";
import api from "../../config/api";

// --- Types ---

interface Doctor {
  id: string;
  name: string;
  email: string;
  gender: string;
  specialty: string;
  crm: string;
  phone: string;
  profileImage: string | null;
  createdAt: string;
}

interface SentInvite {
  id: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "expired";
  createdAt: string;
  doctor?: {
    id: string;
    name: string;
    specialty: string;
    crm: string;
    profileImage: string | null;
  } | null;
}

const INVITE_STATUS_LABELS: Record<SentInvite["status"], string> = {
  pending: "Pendente",
  approved: "Aceito",
  rejected: "Recusado",
  cancelled: "Cancelado",
  expired: "Expirado",
};

function inviteStatusStyle(status: SentInvite["status"]): string {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "rejected":
    case "expired":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-slate-100 text-slate-600";
    case "pending":
    default:
      return "bg-amber-100 text-amber-700";
  }
}

// --- Helpers ---

// Normalizes a CRM (stored as "SP-100001" or "100001/SP") to the "numero/uf" format.
function formatCrm(crm: string): string {
  if (!crm) return "";
  const dashMatch = crm.match(/^([A-Za-z]{2})-(\d+)$/);
  if (dashMatch) {
    return `${dashMatch[2]}/${dashMatch[1].toUpperCase()}`;
  }
  const slashMatch = crm.match(/^(\d+)\/([A-Za-z]{2})$/);
  if (slashMatch) {
    return `${slashMatch[1]}/${slashMatch[2].toUpperCase()}`;
  }
  return crm;
}

// --- Helper Components ---

function DoctorCard({
  doctor,
  onClick,
}: {
  doctor?: Doctor;
  onClick?: () => void;
}) {
  if (!doctor) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <div
        onClick={onClick}
        className="block bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer"
      >
        <div className="flex items-start gap-4">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            {doctor.profileImage ? (
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                {doctor.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors font-display truncate">
              {doctor.name}
            </h5>
            <p className="text-gray-500 text-sm font-medium truncate">
              {doctor.specialty}
            </p>
            <p className="text-gray-400 text-xs font-medium whitespace-nowrap">
              CRM: {formatCrm(doctor.crm)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- List Row View ---

function DoctorListRow({
  doctor,
  onClick,
}: {
  doctor: Doctor;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center justify-between gap-6 cursor-pointer"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-100">
          {doctor.profileImage ? (
            <img
              src={doctor.profileImage}
              alt={doctor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
              {doctor.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h5 className="font-bold text-base leading-tight text-slate-900 truncate">
            {doctor.name}
          </h5>
          <p className="text-slate-400 text-sm font-medium truncate">
            {doctor.specialty}
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
        <span className="whitespace-nowrap">CRM: {formatCrm(doctor.crm)}</span>
        <span>{doctor.email}</span>
      </div>
    </motion.div>
  );
}

// --- Main Page ---

type DoctorTab = "Médicos da Clínica" | "Pesquisar Médicos" | "Solicitações";

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<DoctorTab>("Médicos da Clínica");

  // Search tab state
  const [searchDoctorTerm, setSearchDoctorTerm] = useState("");
  const [searchView, setSearchView] = useState<"grid" | "list">("grid");
  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [invitingDoctorId, setInvitingDoctorId] = useState<string | null>(null);

  // Requests (sent invites) tab state
  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [cancelingInviteId, setCancelingInviteId] = useState<string | null>(
    null,
  );

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const loadSentInvites = useCallback(async () => {
    setInvitesLoading(true);
    try {
      const token = localStorage.getItem("pocketmed_token");
      const response = await api.get("/clinic-association/invites/sent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSentInvites(Array.isArray(response.data) ? response.data : []);
    } catch {
      setSentInvites([]);
    } finally {
      setInvitesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "Solicitações") {
      loadSentInvites();
    }
  }, [activeTab, loadSentInvites]);

  async function handleCancelInvite(inviteId: string) {
    setCancelingInviteId(inviteId);
    try {
      const token = localStorage.getItem("pocketmed_token");
      await api.patch(
        `/clinic-association/invites/${inviteId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Solicitação cancelada com sucesso.");
      loadSentInvites();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Erro ao cancelar solicitação.";
      toast.error(message);
    } finally {
      setCancelingInviteId(null);
    }
  }

  async function fetchDoctors() {
    setLoading(true);
    try {
      const token = localStorage.getItem("pocketmed_token");
      const response = await api.get("/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(response.data);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchDoctor(term: string) {
    setSearchDoctorTerm(term);

    if (!term.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    // Parse input: try to extract CRM number and state
    // Accepts formats like "123456 SP", "123456/SP", "SP-123456", "SP 123456"
    const trimmed = term.trim();
    let crm = "";
    let state = "";

    const matchNumState = trimmed.match(
      /^(\d{1,10})\s*[\/\-\s]\s*([A-Za-z]{2})$/,
    );
    const matchStateNum = trimmed.match(
      /^([A-Za-z]{2})\s*[\/\-\s]\s*(\d{1,10})$/,
    );

    if (matchNumState) {
      crm = matchNumState[1];
      state = matchNumState[2].toUpperCase();
    } else if (matchStateNum) {
      state = matchStateNum[1].toUpperCase();
      crm = matchStateNum[2];
    } else {
      // Try general search by name/specialty/crm
      setSearchResults(
        doctors.filter(
          (d) =>
            d.name.toLowerCase().includes(trimmed.toLowerCase()) ||
            d.specialty.toLowerCase().includes(trimmed.toLowerCase()) ||
            d.crm.toLowerCase().includes(trimmed.toLowerCase()),
        ),
      );
      setSearchError(null);
      return;
    }

    if (!crm || !state) return;

    setSearchLoading(true);
    setSearchError(null);
    try {
      const token = localStorage.getItem("pocketmed_token");
      const response = await api.get("/clinic-association/doctors/search", {
        params: { crm, state },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults([response.data]);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setSearchResults([]);
        setSearchError("Nenhum médico encontrado com o CRM informado");
      } else {
        setSearchError("Erro ao buscar médico. Tente novamente.");
      }
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleInviteDoctor(doctorId: string) {
    setInvitingDoctorId(doctorId);
    try {
      const token = localStorage.getItem("pocketmed_token");
      await api.post(
        "/clinic-association/invites",
        { doctorId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Solicitação enviada com sucesso!");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Erro ao enviar solicitação.";
      toast.error(message);
    } finally {
      setInvitingDoctorId(null);
    }
  }

  const filteredDoctors = useMemo(() => {
    let result = doctors;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.specialty.toLowerCase().includes(term) ||
          d.crm.toLowerCase().includes(term) ||
          d.email.toLowerCase().includes(term),
      );
    }
    return result;
  }, [doctors, searchTerm]);

  const tabs: DoctorTab[] = [
    "Médicos da Clínica",
    "Pesquisar Médicos",
    "Solicitações",
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-4xl font-extrabold font-display tracking-tight text-gray-900">
              Gestão de Médicos
            </h2>
            <p className="text-gray-500 font-medium">
              Pesquise e gerencie a equipe médica da clínica.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<PlusCircle size={18} />}
            onClick={() => setActiveTab("Pesquisar Médicos")}
          >
            Adicionar Médico
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-white rounded-2xl w-fit shadow-sm border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                tab === activeTab
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800 bg-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab: Médicos da Clínica */}
        <div className={activeTab === "Médicos da Clínica" ? "" : "hidden"}>
          <div className="space-y-6">
            <SearchWithViewToggle
              placeholder="Buscar por nome, especialidade ou CRM..."
              value={searchTerm}
              onChange={setSearchTerm}
              view={view}
              onViewChange={setView}
            />

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <UserX size={48} className="mb-4" />
                <p className="text-lg font-semibold text-slate-600">
                  Nenhum médico encontrado
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {searchTerm
                    ? "Tente ajustar os filtros de busca"
                    : "Cadastre o primeiro médico da equipe"}
                </p>
              </div>
            ) : (
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    : "space-y-4"
                }
              >
                {filteredDoctors.map((doctor) =>
                  view === "grid" ? (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      onClick={() => navigate(`/doctors/${doctor.id}/profile`)}
                    />
                  ) : (
                    <DoctorListRow
                      key={doctor.id}
                      doctor={doctor}
                      onClick={() => navigate(`/doctors/${doctor.id}/profile`)}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab: Pesquisar Médicos */}
        <div className={activeTab === "Pesquisar Médicos" ? "" : "hidden"}>
          <div className="space-y-6">
            <SearchWithViewToggle
              placeholder="Buscar por nome, especialidade ou CRM..."
              value={searchDoctorTerm}
              onChange={handleSearchDoctor}
              view={searchView}
              onViewChange={setSearchView}
            />

            {/* Content */}
            {searchLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : searchError && searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <UserX size={48} className="mb-4" />
                <p className="text-lg font-semibold text-slate-600">
                  {searchError}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Tente buscar pelo CRM e estado (ex: 123456 SP)
                </p>
              </div>
            ) : searchResults.length === 0 && !searchDoctorTerm.trim() ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <UserX size={48} className="mb-4 opacity-50" />
                <p className="font-medium text-lg text-slate-600">
                  Pesquisar Médicos
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Busque por CRM e estado (ex: 123456 SP) para encontrar
                  médicos.
                </p>
              </div>
            ) : searchResults.length === 0 && searchDoctorTerm.trim() ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <UserX size={48} className="mb-4" />
                <p className="text-lg font-semibold text-slate-600">
                  Nenhum médico encontrado
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Tente ajustar os termos de busca
                </p>
              </div>
            ) : (
              <div
                className={
                  searchView === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    : "space-y-4"
                }
              >
                {searchResults.map((doctor) =>
                  searchView === "grid" ? (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -6 }}
                      className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start gap-4 mb-5">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          {doctor.profileImage ? (
                            <img
                              src={doctor.profileImage}
                              alt={doctor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                              {doctor.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-sm leading-tight font-display truncate">
                            {doctor.name}
                          </h5>
                          <p className="text-gray-500 text-sm font-medium truncate">
                            {doctor.specialty}
                          </p>
                          <p className="text-gray-400 text-xs font-medium whitespace-nowrap">
                            CRM: {formatCrm(doctor.crm)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleInviteDoctor(doctor.id)}
                          disabled={invitingDoctorId === doctor.id}
                          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {invitingDoctorId === doctor.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                          Enviar Convite
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={doctor.id}
                      whileHover={{ y: -2 }}
                      className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-100">
                          {doctor.profileImage ? (
                            <img
                              src={doctor.profileImage}
                              alt={doctor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                              {doctor.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-base leading-tight text-slate-900 truncate">
                            {doctor.name}
                          </h5>
                          <p className="text-slate-400 text-sm font-medium truncate">
                            {doctor.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
                        <span className="whitespace-nowrap">
                          CRM: {formatCrm(doctor.crm)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleInviteDoctor(doctor.id)}
                        disabled={invitingDoctorId === doctor.id}
                        className="shrink-0 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer border-none flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {invitingDoctorId === doctor.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        Enviar Convite
                      </button>
                    </motion.div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab: Solicitações */}
        <div className={activeTab === "Solicitações" ? "" : "hidden"}>
          {invitesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : sentInvites.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium text-lg text-slate-600">Solicitações</p>
              <p className="text-sm text-slate-400 mt-1">
                Nenhuma solicitação enviada. Use a aba "Pesquisar Médicos" para
                convidar um médico cadastrado na Hispora.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-100">
                      {invite.doctor?.profileImage ? (
                        <img
                          src={invite.doctor.profileImage}
                          alt={invite.doctor?.name || "Médico"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                          {(invite.doctor?.name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-base leading-tight text-slate-900 truncate">
                        {invite.doctor?.name || "Médico"}
                      </h5>
                      <p className="text-slate-400 text-sm font-medium truncate">
                        {invite.doctor?.specialty || "—"}
                        {invite.doctor?.crm
                          ? ` • CRM: ${formatCrm(invite.doctor.crm)}`
                          : ""}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Enviada em{" "}
                        {new Date(invite.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${inviteStatusStyle(invite.status)}`}
                    >
                      {INVITE_STATUS_LABELS[invite.status]}
                    </span>
                    {invite.status === "pending" && (
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        disabled={cancelingInviteId === invite.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer border-none bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelingInviteId === invite.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
