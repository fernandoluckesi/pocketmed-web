import { useState } from "react";
import {
  Calendar,
  User,
  Droplet,
  AlertTriangle,
  Activity,
  Stethoscope,
  MapPin,
  FileText,
  Trash2,
  Plus,
  Edit,
  Share2,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/MainLayout";

// --- Types ---

interface Patient {
  id: string;
  name: string;
  birthDate: string;
  age: number;
  bloodType: string;
  contact: string;
  allergies: string[];
  imageUrl: string;
  verified: boolean;
}

interface Consultation {
  id: string;
  patientId: string;
  dateDay: string;
  dateMonth: string;
  title: string;
  doctorName: string;
  specialty: string;
  locationOrTime: string;
  status: "Concluído" | "Agendado" | "Cancelado";
}

interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  type: "Contínuo" | "Suplemento" | "Temporário";
  nextDose: string;
  stockInfo?: string;
}

interface MedicalDocument {
  id: string;
  patientId: string;
  title: string;
  date: string;
  source: string;
  type: "Exame" | "Laudo" | "Receita";
}

// --- Mock Data ---

const mockPatient: Patient = {
  id: "MED-88291",
  name: "Helena S. Ferreira",
  birthDate: "12 Mai 1985",
  age: 38,
  bloodType: "O+ Positivo",
  contact: "(11) 98822-1020",
  allergies: ["Penicilina", "Ácaros"],
  imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwD3agWDI7SEvl1bpLwdUioc7oKfWMda1hFdviDdkL__XzNKtH3o-6rtY3rBLOxixtQLTlfswQ3TiMHYIALBh9da4nqcC1KzWx3LnsTbsBJL0cKxJgyoZISEnSVBSQVWzIEat6E6bGqLD9P0yRbIqMaV0gvzeFtzjwxcVMeQMDdFSqqz05Kcybg76U_rc-ipke32alRy7MLsl4gfqg5x4SZ-jBdBy4N8ibE9_mF6fBXW_veVdzKPr9AoZtyjKC33fjCN7x1x6fImN1",
  verified: true,
};

const mockConsultations: Consultation[] = [
  {
    id: "C-1",
    patientId: "MED-88291",
    dateDay: "14",
    dateMonth: "OUT",
    title: "Check-up Geral Trimestral",
    doctorName: "Dr. Ricardo Fontes",
    specialty: "Cardiologia",
    locationOrTime: "Unidade Paulista",
    status: "Concluído",
  },
  {
    id: "C-2",
    patientId: "MED-88291",
    dateDay: "02",
    dateMonth: "NOV",
    title: "Retorno Exames de Sangue",
    doctorName: "Dra. Alice Moraes",
    specialty: "Clínica",
    locationOrTime: "09:30 AM",
    status: "Agendado",
  },
];

const mockMedications: Medication[] = [
  {
    id: "M-1",
    patientId: "MED-88291",
    name: "Losartana Potássica",
    dosage: "50mg",
    frequency: "1 comprimido ao dia",
    type: "Contínuo",
    nextDose: "Amanhã, 08:00",
    stockInfo: "15 dias restantes",
  },
  {
    id: "M-2",
    patientId: "MED-88291",
    name: "Vitamina D3",
    dosage: "2.000 UI",
    frequency: "1 gota ao dia",
    type: "Suplemento",
    nextDose: "Hoje, 20:00",
    stockInfo: "Estoque regular",
  },
];

const mockDocuments: MedicalDocument[] = [
  {
    id: "D-1",
    patientId: "MED-88291",
    title: "Hemograma Completo.pdf",
    date: "12 Out 2023",
    source: "Lab. Fleury",
    type: "Exame",
  },
  {
    id: "D-2",
    patientId: "MED-88291",
    title: "Ecocardiograma_Doppler.pdf",
    date: "05 Out 2023",
    source: "Hosp. Albert Einstein",
    type: "Laudo",
  },
  {
    id: "D-3",
    patientId: "MED-88291",
    title: "Receita_Padrão_Losartana.pdf",
    date: "14 Ago 2023",
    source: "Dr. Ricardo F.",
    type: "Receita",
  },
];

// --- Components ---

function PatientHero({ patient }: { patient: Patient }) {
  return (
    <section className="flex flex-col md:flex-row gap-8 items-start mb-10">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-blue-300 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <img
          alt={patient.name}
          className="relative w-40 h-40 rounded-[1.75rem] object-cover shadow-2xl border-4 border-white"
          src={patient.imageUrl}
          referrerPolicy="no-referrer"
        />
        {patient.verified && (
          <div className="absolute bottom-2 right-2 bg-blue-100 text-primary p-2 rounded-xl shadow-lg border border-white">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        )}
      </div>

      <div className="flex-grow pt-2">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900">
            {patient.name}
          </h1>
          <span className="px-3 py-1 bg-slate-200 rounded-full text-xs font-bold text-slate-600">
            ID: #{patient.id}
          </span>
        </div>

        <div className="flex flex-wrap gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nascimento</p>
              <p className="font-semibold text-sm">{patient.birthDate} ({patient.age} anos)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Droplet className="w-4 h-4 text-red-500 fill-red-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tipo Sanguíneo</p>
              <p className="font-semibold text-sm">{patient.bloodType}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contato</p>
              <p className="font-semibold text-sm">{patient.contact}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-red-700 tracking-wider">Alergias</p>
              <p className="font-semibold text-sm text-red-700">
                {patient.allergies.join(", ") || "Nenhuma informada"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 self-start pt-2">
        <button className="p-3 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer border-none">
          <Edit className="w-4 h-4" />
        </button>
        <button className="p-3 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer border-none">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

function ConsultationsTab({ consultations }: { consultations: Consultation[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">Histórico de Atendimentos</h3>
        <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:opacity-90 transition-all shadow-sm cursor-pointer border-none">
          <Plus className="w-3.5 h-3.5" />
          Nova Consulta
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {consultations.map((consulta) => (
          <div
            key={consulta.id}
            className={`group bg-white hover:bg-slate-50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 transition-all duration-300 border border-slate-100 shadow-sm ${
              consulta.status === "Agendado" ? "border-l-4 border-l-primary" : ""
            }`}
          >
            <div className="flex flex-col items-center justify-center bg-white w-20 h-20 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
              <span className="text-xl font-black text-primary">{consulta.dateDay}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{consulta.dateMonth}</span>
            </div>

            <div className="flex-grow min-w-0">
              <h4 className="font-bold text-lg text-slate-900 truncate">{consulta.title}</h4>
              <div className="flex gap-4 mt-2 flex-wrap text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                  <span>{consulta.doctorName} ({consulta.specialty})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{consulta.locationOrTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                consulta.status === "Concluído"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-primary"
              }`}>
                {consulta.status}
              </span>
              <button className="p-2 rounded-full hover:bg-white text-slate-400 hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MedicationsTab({ medications }: { medications: Medication[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">Prescrições Ativas</h3>
        <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:opacity-90 transition-all shadow-sm cursor-pointer border-none">
          <Plus className="w-3.5 h-3.5" />
          Adicionar Medicamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map((med) => (
          <div key={med.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-xl flex-shrink-0 ${
              med.type === "Contínuo" ? "bg-blue-50 text-primary" : "bg-amber-50 text-amber-700"
            }`}>
              <Activity className="w-5 h-5" />
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-lg text-slate-950 truncate">{med.name}</h4>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase flex-shrink-0">
                  {med.type}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{med.dosage} • {med.frequency}</p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-semibold text-slate-600">
                  {med.nextDose ? `Próxima dose: ${med.nextDose}` : "Conforme orientação médica"}
                </span>
                <div className="flex items-center gap-2">
                  {med.stockInfo && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {med.stockInfo}
                    </span>
                  )}
                  <button className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsTab({ documents }: { documents: MedicalDocument[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">Documentos & Laudos</h3>
        <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:opacity-90 transition-all shadow-sm cursor-pointer border-none">
          <Plus className="w-3.5 h-3.5" />
          Adicionar Documento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="group bg-slate-50 hover:bg-slate-100/50 rounded-2xl p-4 transition-all border border-slate-100">
            <div className="aspect-video bg-slate-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
              <FileText className="w-10 h-10 text-slate-500 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 uppercase">
                {doc.type}
              </div>
            </div>
            <h4 className="font-bold text-sm text-slate-800 truncate" title={doc.title}>
              {doc.title}
            </h4>
            <p className="text-xs text-slate-500 mt-1">{doc.date} • {doc.source}</p>

            <div className="mt-4 flex gap-2">
              <button className="flex-grow text-[10px] font-bold py-2 bg-white hover:bg-primary hover:text-white rounded-lg transition-colors border border-slate-200 cursor-pointer">
                VISUALIZAR
              </button>
              <button className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors border border-slate-200 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Page ---

export default function PatientDetail() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"consultas" | "medicamentos" | "exames">("consultas");

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/patients")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={20} />
          <span>Voltar para Pacientes</span>
        </button>

        {/* Patient Hero */}
        <PatientHero patient={mockPatient} />

        {/* Tabs Navigation */}
        <div className="flex space-x-1 p-1 bg-white rounded-2xl w-fit shadow-sm border border-gray-100 mb-8">
          <button
            className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
              activeTab === "consultas"
                ? "bg-primary/5 text-primary"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("consultas")}
          >
            Consultas
          </button>
          <button
            className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
              activeTab === "medicamentos"
                ? "bg-primary/5 text-primary"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("medicamentos")}
          >
            Medicamentos
          </button>
          <button
            className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
              activeTab === "exames"
                ? "bg-primary/5 text-primary"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("exames")}
          >
            Exames & Receitas
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "consultas" && <ConsultationsTab consultations={mockConsultations} />}
        {activeTab === "medicamentos" && <MedicationsTab medications={mockMedications} />}
        {activeTab === "exames" && <DocumentsTab documents={mockDocuments} />}
      </div>
    </MainLayout>
  );
}
