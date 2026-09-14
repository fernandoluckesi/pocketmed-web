import { useEffect, useState } from "react";
import {
  MapPin,
  Mail,
  Phone,
  Stethoscope,
  IdCard,
  ArrowLeft,
  Users,
  CalendarClock,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { MainLayout } from "../../components/MainLayout";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../services/api";

// --- Types ---

interface DoctorProfileAppointment {
  id: string;
  patientName: string;
  dateTime: string;
  status: string;
  reason: string;
}

interface DoctorProfilePatient {
  id: string;
  name: string;
}

interface DoctorProfileData {
  id: string;
  name: string;
  email: string;
  specialty: string;
  crm: string;
  rqe: string | null;
  phone: string;
  gender: string;
  profileImage: string | null;
  appointments: DoctorProfileAppointment[];
  patients: DoctorProfilePatient[];
}

// --- Helpers ---

const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  pending_approval: "Aguardando aprovação",
  approved: "Agendada",
  rejected: "Recusada",
  completed: "Concluída",
};

function getStatusLabel(status: string): string {
  return APPOINTMENT_STATUS_LABELS[status] || status;
}

function getStatusStyle(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "pending":
    case "pending_approval":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-blue-100 text-primary";
  }
}

function formatPhone(value: string): string {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}

// --- Components ---

function ProfileHero({ doctor }: { doctor: DoctorProfileData }) {
  return (
    <section className="flex flex-col md:flex-row gap-8 items-start mb-2">
      <div className="relative group">
        {doctor.profileImage ? (
          <img
            src={doctor.profileImage}
            alt={doctor.name}
            referrerPolicy="no-referrer"
            className="w-32 h-32 rounded-[1.75rem] object-cover border-4 border-white"
          />
        ) : (
          <div className="w-32 h-32 rounded-[1.75rem] border-4 border-white bg-primary/10 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">
              {doctor.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 pt-1">
        <div className="flex flex-wrap gap-2">
          <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold">
            {doctor.specialty || "Médico(a)"}
          </span>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
            CRM {doctor.crm}
          </span>
          {doctor.rqe && (
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
              RQE {doctor.rqe}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-display font-extrabold tracking-tight text-on-surface">
          {doctor.name}
        </h1>
        <div className="flex flex-wrap gap-6 mt-2">
          {doctor.email && (
            <div className="flex items-center gap-2 text-on-surface-variant font-medium">
              <Mail size={18} className="text-primary" />
              <span className="text-sm">{doctor.email}</span>
            </div>
          )}
          {doctor.phone && (
            <div className="flex items-center gap-2 text-on-surface-variant font-medium">
              <Phone size={18} className="text-primary" />
              <span className="text-sm">{formatPhone(doctor.phone)}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProfileDetails({ doctor }: { doctor: DoctorProfileData }) {
  const items = [
    { icon: Stethoscope, label: "Especialidade", value: doctor.specialty },
    { icon: IdCard, label: "CRM", value: doctor.crm },
    { icon: IdCard, label: "RQE", value: doctor.rqe || "—" },
    {
      icon: MapPin,
      label: "Gênero",
      value: doctor.gender || "—",
    },
  ];

  return (
    <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold font-display text-slate-900 mb-6">
        Dados profissionais
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
              <item.icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-slate-800 capitalize truncate">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AppointmentsSection({
  appointments,
}: {
  appointments: DoctorProfileAppointment[];
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
          <CalendarClock size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">
            Consultas agendadas
          </h2>
          <p className="text-sm text-slate-500">
            {appointments.length} consulta{appointments.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhuma consulta registrada</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="px-8 py-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {apt.patientName}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {apt.reason || "Consulta"}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(apt.dateTime).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(apt.status)}`}
                >
                  {getStatusLabel(apt.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LinkedPatientsSection({
  patients,
}: {
  patients: DoctorProfilePatient[];
}) {
  const navigate = useNavigate();

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
          <Users size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">
            Pacientes atrelados
          </h2>
          <p className="text-sm text-slate-500">
            {patients.length} paciente{patients.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhum paciente atrelado</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {patients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="w-full text-left px-8 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-900 truncate">
                {patient.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// --- Main Page ---

export default function DoctorProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<DoctorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api(`/clinic-association/doctors/${id}/profile`);
        if (!cancelled) setDoctor(data);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 403) {
            setError("Você não tem permissão para ver este perfil.");
          } else if (err instanceof ApiError && err.status === 404) {
            setError("Médico não encontrado nesta clínica.");
          } else {
            setError("Erro ao carregar o perfil do médico.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <MainLayout>
      <div className="space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Carregando perfil...
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-500">
            {error}
          </div>
        ) : doctor ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <ProfileHero doctor={doctor} />
            <ProfileDetails doctor={doctor} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <AppointmentsSection appointments={doctor.appointments} />
              <LinkedPatientsSection patients={doctor.patients} />
            </div>
          </motion.div>
        ) : null}
      </div>
    </MainLayout>
  );
}
