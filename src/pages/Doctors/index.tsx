import { useState } from "react";
import {
  PlusCircle,
  Filter,
  LayoutGrid,
  CalendarRange,
  Award,
  Baby,
  Brain,
  Microscope,
  Bone,
  Search,
  MapPin,
  BadgeCheck,
  Star,
  Eye,
} from "lucide-react";
import { motion } from "motion/react";
import { MainLayout } from "../../components/MainLayout";

// --- Types ---

const DoctorStatus = {
  AVAILABLE: "AVAILABLE",
  IN_CONSULTATION: "IN_CONSULTATION",
  AWAY: "AWAY",
} as const;

type DoctorStatusType = typeof DoctorStatus[keyof typeof DoctorStatus];

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;
  status: DoctorStatusType;
  image: string;
}

interface SearchDoctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  verified: boolean;
}

// --- Mock Data ---

const MOCK_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Roberto Silva",
    specialty: "Cardiologia",
    crm: "CRM 12345-SP",
    status: DoctorStatus.AVAILABLE,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKa9zpUoZ50TEGCJDq9_kcft8A2PjgGkOmBMT7OHk2x0sHR8wOiuZUNcfzW4fTmbQ2bfy1NPhLbnKSoBo2m9RMhjaUXH9p1nJoy22mEKZEnqTtKOzyxamDXxBpjxmr7aitRNBzhJjLFzl4GP5YR0CqdHOyNlJi4RUT6ndI9lylglisioWkKFS7s_vPLgWXBtXRUXUjXll3876CN7AXgbodefrM8Q0nDCbFd4O-uGbP9f6P68o8iRRKuLQ0x6MVyX6sk3ssvA6DCaN1",
  },
  {
    id: "2",
    name: "Dra. Ana Paula",
    specialty: "Pediatria",
    crm: "CRM 67890-SP",
    status: DoctorStatus.IN_CONSULTATION,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAI3GAO7J4muohOby7qmxoaDO-w-uDQ3lFqW8JT3QC6LID-ql6ei7AqZZgq5cUp1SEpGFXEzrka2gK2qEKJNbW5Yhh4phAz6cdCHK-fnLDtdcLnxPdjrRwyPgNn20_fxz8GUncZ6tnV3a2xj5OTowbiBxAfmEA--2gZycdZcS3G9Ad4D1J8jSEIgRQRxQr8KUqOB02XMLpxUQ7hIYuHP0XjptCNHaZATeWbfvu5xcHXsaqDHJudQAj1SI7789C13Suz0wG0aNn1Nxlz",
  },
  {
    id: "3",
    name: "Dr. Marcos Lima",
    specialty: "Neurologia",
    crm: "CRM 45612-SP",
    status: DoctorStatus.AWAY,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBDWrlw6sfpKG4hDLkE2ptjBHNtkszNiYT4k5rGL_SCJK-iNbOjAJ5NqazhvfPhMEoZ4zC7pmGShe22bOn75bvRNIpbIcYBk2VWItEPBtAbmRIT2waDj9cXwkycnt3kreMB3dAhJvQDk6eXu63x8WuJgSbFJxhKy6By6XfO4Hp8Rl-9mqwwpsRJcN5FpCldxRDtN7YF_TF7I4RSVC7RoVVR1xinY9PBJlEW9Za313srBUT3Tr3t4uAzxiLQKtjFVhG6kzfGCU1e6QC",
  },
  {
    id: "4",
    name: "Dra. Juliana Mendes",
    specialty: "Oncologia",
    crm: "CRM 99221-SP",
    status: DoctorStatus.AVAILABLE,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTgJVR5TmGW284Z5k3M018yGoiAJlxoyzL5AZZofGOgbP-7lag_vKt_o-icC-PKqJ7sxPYwKfKP7BXV-XbuZiH7H02-br3v-9uW_ealcnKRs3Oc-f6Jm3rfmQZgUf7QICBnqWB_Rzp2H7608YwT9M-kflJYru8KPRBBOsVphq8yk5qRsRbtZwlqfF_BVBc1eYG-PNTBW8aoSt8HmlhsdiGBULZDZCfGHL2PkeYkZajnq1FFKDSReIFKfvmgDVGhosgtSdAZuR01f4Z",
  },
  {
    id: "5",
    name: "Dr. Fabio Rocha",
    specialty: "Ortopedia",
    crm: "CRM 33114-SP",
    status: DoctorStatus.AVAILABLE,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHnl677367I-M6dSeDVivKf_uJYqD-eI_e3bqTy7NF3R0S17TioshxZxQj966_AKfzz8ctU1dEj5GRWfNEnP8fsEVKdz1vl8oTHPMRk5WwTdaS8I8CN7NGr_Yov-Ibesm1H98jbzG5bqqXPeTJ4qdyNuRcHZVHzFH5JvDyqcxjncC72f_KOX1uI25rS1FuwI15e_vqDL5RD7T05W9BU3jb0pYILNFXjEeUH6WFS9cyjBaVGzE1WZ3n_rcGUER-ETHTOwQu57FIkqHh",
  },
];

const MOCK_SEARCH_DOCTORS: SearchDoctor[] = [
  {
    id: "1",
    name: "Dr. André Santos",
    specialty: "Cardiologia",
    crm: "CRM/SP 123456",
    location: "São Paulo, SP",
    distance: "2.4km",
    rating: 4.9,
    reviews: 128,
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=256&h=256&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "2",
    name: "Dra. Juliana Lima",
    specialty: "Neurologia",
    crm: "CRM/RJ 789012",
    location: "Rio de Janeiro, RJ",
    distance: "5.1km",
    rating: 5.0,
    reviews: 94,
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71f15367ef?q=80&w=256&h=256&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "3",
    name: "Dr. Ricardo Alves",
    specialty: "Pediatria",
    crm: "CRM/MG 456789",
    location: "Belo Horizonte, MG",
    distance: "3.8km",
    rating: 4.8,
    reviews: 215,
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6028d?q=80&w=256&h=256&auto=format&fit=crop",
    verified: true,
  },
];

const QUICK_FILTERS = ["Cardiologia", "Pediatria", "Neurologia", "Ortopedia"];

// --- Helper Components ---

function SpecialtyIcon({ specialty }: { specialty: string }) {
  if (specialty.includes("Cardiologia")) return <Award size={14} />;
  if (specialty.includes("Pediatria")) return <Baby size={14} />;
  if (specialty.includes("Neurologia")) return <Brain size={14} />;
  if (specialty.includes("Oncologia")) return <Microscope size={14} />;
  if (specialty.includes("Ortopedia")) return <Bone size={14} />;
  return <Award size={14} />;
}

function StatusBadge({ status }: { status: DoctorStatusType }) {
  switch (status) {
    case DoctorStatus.AVAILABLE:
      return (
        <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
          Available
        </span>
      );
    case DoctorStatus.IN_CONSULTATION:
      return (
        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
          In Consultation
        </span>
      );
    case DoctorStatus.AWAY:
      return (
        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
          Away
        </span>
      );
  }
}

function DoctorCard({ doctor, isAddCard }: { doctor?: Doctor; isAddCard?: boolean }) {
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
          <p className="font-display font-bold text-slate-900">Adicionar Novo Médico</p>
          <p className="text-slate-500 text-sm">Cadastre um profissional na rede.</p>
        </div>
      </motion.div>
    );
  }

  if (!doctor) return null;

  const statusColor =
    doctor.status === DoctorStatus.AVAILABLE
      ? "bg-green-500"
      : doctor.status === DoctorStatus.IN_CONSULTATION
        ? "bg-orange-500"
        : "bg-gray-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 12px 32px rgba(25, 28, 30, 0.08)" }}
      className="bg-white rounded-[2rem] p-8 transition-all flex flex-col space-y-6 shadow-sm border border-slate-100"
    >
      <div className="flex justify-between items-start">
        <div className="relative">
          <img alt={doctor.name} className="w-20 h-20 rounded-full object-cover" src={doctor.image} />
          <span className={`absolute bottom-0 right-0 w-6 h-6 ${statusColor} border-4 border-white rounded-full`}></span>
        </div>
        <StatusBadge status={doctor.status} />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-display font-bold text-slate-900">{doctor.name}</h3>
        <p className="text-primary text-sm font-semibold flex items-center gap-1">
          <SpecialtyIcon specialty={doctor.specialty} />
          {doctor.specialty} • {doctor.crm}
        </p>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-colors cursor-pointer border-none">
          Ver Perfil
        </button>
        <button
          className={`flex-1 bg-primary text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer border-none ${doctor.status === DoctorStatus.AWAY ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <CalendarRange size={16} />
          Ver Agenda
        </button>
      </div>
    </motion.div>
  );
}

function SearchDoctorCard({ doctor }: { doctor: SearchDoctor }) {
  return (
    <div className="group rounded-2xl bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
      <div className="mb-6 flex items-start gap-4">
        <div className="relative">
          <img
            src={doctor.imageUrl}
            alt={doctor.name}
            className="h-20 w-20 rounded-2xl object-cover shadow-md"
          />
          {doctor.verified && (
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-primary text-white">
              <BadgeCheck size={16} fill="white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h5 className="font-display text-lg font-bold text-on-surface transition-colors group-hover:text-primary">
            {doctor.name}
          </h5>
          <p className="text-sm font-bold text-primary">{doctor.specialty}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-on-surface-variant">
            {doctor.crm}
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <MapPin size={18} />
          <span>{doctor.location} • {doctor.distance} de distância</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Star size={18} className="text-amber-400 fill-amber-400" />
          <span className="font-bold text-on-surface">{doctor.rating.toFixed(1)}</span>
          <span>({doctor.reviews} avaliações)</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/10 transition-all hover:bg-primary-container">
          Solicitar Acesso
        </button>
        <button className="rounded-xl bg-surface-container-high px-4 py-3 text-on-surface-variant transition-all hover:bg-surface-container-highest">
          <Eye size={20} />
        </button>
      </div>
    </div>
  );
}

function SearchHero() {
  return (
    <div className="relative mb-12 overflow-hidden rounded-[2rem] bg-surface-container-low p-12">
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h3 className="mb-4 font-display text-4xl font-extrabold text-on-surface">Encontre Novos Profissionais</h3>
        <p className="mb-10 text-on-surface-variant">Pesquise na rede global do PocketMed por especialidade, CRM ou localização.</p>

        <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-on-surface/5 md:flex-row">
          <div className="flex flex-1 items-center gap-3 border-outline-variant/20 px-4 md:border-r">
            <Search className="text-primary" size={20} />
            <input
              type="text"
              placeholder="Nome, especialidade ou CRM"
              className="w-full border-none py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-0"
            />
          </div>
          <div className="flex flex-1 items-center gap-3 px-4">
            <MapPin className="text-primary" size={20} />
            <input
              type="text"
              placeholder="Localização"
              className="w-full border-none py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-0"
            />
          </div>
          <button className="rounded-xl bg-primary px-10 py-3 font-bold text-white transition-all hover:bg-primary-container active:scale-95">
            Pesquisar
          </button>
        </div>

        {/* Quick Filters */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
          <span className="mr-2 text-sm font-bold text-on-surface-variant">Filtros rápidos:</span>
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter}
              className="rounded-full bg-surface-container-high px-5 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function Doctors() {
  const [activeTab, setActiveTab] = useState<"my-doctors" | "search">("my-doctors");

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Hero Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <h2 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">Gestão de Médicos</h2>
            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
              Gerencie sua equipe clínica, acompanhe disponibilidades e visualize perfis profissionais.
            </p>
          </div>
          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border-none">
            <PlusCircle size={20} />
            Adicionar Médico
          </button>
        </div>

        {/* Tabs + Filters */}
        <div className="flex items-center justify-between">
          <div className="flex bg-slate-100 p-1.5 rounded-full w-fit">
            <button
              onClick={() => setActiveTab("my-doctors")}
              className={`px-8 py-2.5 rounded-full font-bold transition-all cursor-pointer border-none ${
                activeTab === "my-doctors"
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Meus Médicos
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`px-8 py-2.5 rounded-full font-bold transition-all cursor-pointer border-none ${
                activeTab === "search"
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Pesquisar Médicos
            </button>
          </div>
          {activeTab === "my-doctors" && (
            <div className="flex gap-3">
              <button className="p-3 bg-white rounded-xl text-slate-500 hover:text-primary transition-colors flex items-center gap-2 shadow-sm cursor-pointer border border-slate-100">
                <Filter size={18} />
                <span className="text-sm font-semibold">Filtros</span>
              </button>
              <button className="p-3 bg-white rounded-xl text-slate-500 hover:text-primary transition-colors shadow-sm cursor-pointer border border-slate-100">
                <LayoutGrid size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "my-doctors" ? (
          <>
            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_DOCTORS.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
              <DoctorCard isAddCard />
            </div>

            {/* Stats Footer */}
            <div className="bg-primary text-white rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-800 opacity-50"></div>
              <div className="relative z-10 space-y-2">
                <h3 className="text-3xl font-display font-extrabold">Resumo da Equipe</h3>
                <p className="text-blue-100 text-base opacity-90">Cidade Hospitalar Geral • 2024</p>
              </div>
              <div className="relative z-10 flex gap-14">
                <div className="text-center">
                  <p className="text-5xl font-display font-extrabold mb-1">24</p>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">Médicos Ativos</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-display font-extrabold mb-1">12</p>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">Em Plantão</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-display font-extrabold mb-1">98%</p>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">Disponibilidade</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Search Hero */}
            <SearchHero />

            {/* Results Section */}
            <div>
              <div className="mb-8 flex items-center justify-between">
                <h4 className="font-display text-2xl font-bold text-on-surface">Resultados da Busca</h4>
                <p className="text-sm font-medium text-on-surface-variant">Exibindo {MOCK_SEARCH_DOCTORS.length} especialistas próximos a você</p>
              </div>

              {/* Grid for Results */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_SEARCH_DOCTORS.map((doctor, index) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SearchDoctorCard doctor={doctor} />
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              <div className="mt-12 flex justify-center">
                <button className="rounded-full border border-primary/10 bg-surface-container-low px-8 py-3 font-bold text-primary transition-all hover:bg-surface-container-high">
                  Carregar mais profissionais
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
