import { useState, useEffect, useMemo } from "react";
import {
  PlusCircle,
  LayoutGrid,
  CalendarRange,
  Award,
  Baby,
  Brain,
  Microscope,
  Bone,
  Search,
  BadgeCheck,
  Loader2,
  UserX,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/MainLayout";
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

// --- Helper Components ---

function SpecialtyIcon({ specialty }: { specialty: string }) {
  const s = specialty.toLowerCase();
  if (s.includes("cardiologia")) return <Award size={14} />;
  if (s.includes("pediatria")) return <Baby size={14} />;
  if (s.includes("neurologia")) return <Brain size={14} />;
  if (s.includes("oncologia")) return <Microscope size={14} />;
  if (s.includes("ortopedia")) return <Bone size={14} />;
  return <Award size={14} />;
}

function DoctorCard({
  doctor,
  isAddCard,
}: {
  doctor?: Doctor;
  isAddCard?: boolean;
}) {
  const navigate = useNavigate();

  if (isAddCard) {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className="border-2 border-dashed border-slate-300 rounded-[2rem] p-6 flex flex-col items-center justify-center space-y-4 hover:bg-slate-50 transition-colors cursor-pointer group"
      >
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <CalendarRange size={32} />
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-slate-900">
            Adicionar Novo Médico
          </p>
          <p className="text-slate-500 text-sm">
            Cadastre um profissional na rede.
          </p>
        </div>
      </motion.div>
    );
  }

  if (!doctor) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 12px 32px rgba(25, 28, 30, 0.08)" }}
      className="bg-white rounded-[2rem] p-8 transition-all flex flex-col space-y-6 shadow-sm border border-slate-100"
    >
      <div className="flex justify-between items-start">
        <div className="relative">
          {doctor.profileImage ? (
            <img
              alt={doctor.name}
              className="w-20 h-20 rounded-full object-cover"
              src={doctor.profileImage}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {doctor.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></span>
        </div>
        <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
          <BadgeCheck size={12} />
          Verificado
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-display font-bold text-slate-900">
          {doctor.name}
        </h3>
        <p className="text-primary text-sm font-semibold flex items-center gap-1">
          <SpecialtyIcon specialty={doctor.specialty} />
          {doctor.specialty} • CRM {doctor.crm}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/doctors/${doctor.id}`)}
          className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-colors cursor-pointer border-none"
        >
          Ver Perfil
        </button>
        <button
          onClick={() => navigate(`/doctors/${doctor.id}`)}
          className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer border-none"
        >
          <CalendarRange size={16} />
          Ver Agenda
        </button>
      </div>
    </motion.div>
  );
}

// --- Main Page ---

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

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

  // Extract unique specialties for quick filters
  const specialties = useMemo(() => {
    const set = new Set(doctors.map((d) => d.specialty));
    return Array.from(set).sort();
  }, [doctors]);

  // Filter doctors based on search and active filter
  const filteredDoctors = useMemo(() => {
    let result = doctors;

    if (activeFilter) {
      result = result.filter((d) => d.specialty === activeFilter);
    }

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
  }, [doctors, searchTerm, activeFilter]);

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Hero Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <h2 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
              Gestão de Médicos
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
              Gerencie sua equipe clínica, acompanhe disponibilidades e
              visualize perfis profissionais.
            </p>
          </div>
          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border-none">
            <PlusCircle size={20} />
            Adicionar Médico
          </button>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, especialidade ou CRM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
            <button className="p-4 bg-white rounded-2xl text-slate-500 hover:text-primary transition-colors shadow-sm cursor-pointer border border-slate-200">
              <LayoutGrid size={20} />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-500 mr-2">Filtros rápidos:</span>
            <button
              onClick={() => setActiveFilter(null)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors border-none cursor-pointer ${
                !activeFilter
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              Todos
            </button>
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setActiveFilter(activeFilter === spec ? null : spec)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors border-none cursor-pointer ${
                  activeFilter === spec
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <UserX size={48} className="mb-4" />
            <p className="text-lg font-semibold text-slate-600">Nenhum médico encontrado</p>
            <p className="text-sm text-slate-400 mt-1">
              {searchTerm || activeFilter
                ? "Tente ajustar os filtros de busca"
                : "Cadastre o primeiro médico da equipe"}
            </p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-slate-500">
              Exibindo <span className="font-bold text-slate-700">{filteredDoctors.length}</span>{" "}
              {filteredDoctors.length === 1 ? "médico" : "médicos"}
              {activeFilter && <span> em <span className="font-semibold text-primary">{activeFilter}</span></span>}
            </p>

            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
              <DoctorCard isAddCard />
            </div>

            {/* Stats Footer */}
            <div className="bg-primary text-white rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-800 opacity-50"></div>
              <div className="relative z-10 space-y-2">
                <h3 className="text-3xl font-display font-extrabold">
                  Resumo da Equipe
                </h3>
                <p className="text-blue-100 text-base opacity-90">
                  Equipe médica cadastrada
                </p>
              </div>
              <div className="relative z-10 flex gap-14">
                <div className="text-center">
                  <p className="text-5xl font-display font-extrabold mb-1">
                    {doctors.length}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">
                    Médicos Cadastrados
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-display font-extrabold mb-1">
                    {specialties.length}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">
                    Especialidades
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
