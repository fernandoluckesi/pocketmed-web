import {
  MapPin,
  UserPlus,
  Mail,
  FileText,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Award,
  ClipboardList,
  Brain,
  HeartPulse,
  BarChart3,
  StickyNote,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { motion } from "motion/react";
import { MainLayout } from "../../components/MainLayout";
import { useNavigate } from "react-router-dom";

// --- Data ---

const verifiedItems = [
  "Board Certified Neurologist",
  "Active CRM (CFM Validated)",
  "HIPAA Compliant Provider",
];

const interests = ["Memory Care", "Epilepsy", "Sleep Disorders", "Neurogenetics"];

const education = [
  {
    icon: Award,
    title: "MD – Medical Doctor",
    school: "Universidade de São Paulo (USP)",
    years: "2004 — 2010",
  },
  {
    icon: ClipboardList,
    title: "Neurology Residency",
    school: "Hospital das Clínicas da USP",
    years: "2011 — 2014",
  },
  {
    icon: Brain,
    title: "Fellowship in Neurosurgery",
    school: "Johns Hopkins Medicine",
    years: "2015 — 2017",
  },
  {
    icon: HeartPulse,
    title: "Board Certification",
    school: "Brazilian Academy of Neurology",
    years: "Certified 2014",
  },
  {
    icon: BarChart3,
    title: "Masters in Clinical Research",
    school: "Harvard Medical School (Online)",
    years: "2019 — 2021",
  },
  {
    icon: StickyNote,
    title: "Global Health Certification",
    school: "World Health Organization (WHO)",
    years: "Ongoing 2024",
  },
];

// --- Components ---

function ProfileHero() {
  return (
    <section className="flex flex-col md:flex-row gap-8 items-center mb-10">
      <div className="relative group">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary-container/10">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvMm9gImhOUvnfTLWn-1F8e2uqSYfqOlaMxKCWmxXk8Tw61_ZlKI8r3r6CsDy6TaU_fTTOmFxlXco7wNWdzuO8B4uLaMCg8cd2IWSoOKyehXH8tRtumjycFrZcDMAd4JmRjoGhkoS5NHsV9zJ3lKDm5gNp5DCtfp-jRyQGODcbkolgXLRtsYyvLlsxsGkfYUJRxUSVDlo0DCbFnETvi6otIc_vbntwClcj5kFe8uHrHHojYqez8VIv8Q1yz-URcMM4VvFply9UWsch"
              alt="Dra. Juliana Lima"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </motion.div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex gap-2">
          <span className="bg-primary-container/10 text-primary-container border border-primary-container/20 px-3 py-1 rounded-full text-xs font-bold">
            Neurology
          </span>
          <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-bold">
            CRM 123456-RJ
          </span>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-display font-extrabold tracking-tight text-on-surface"
        >
          Dra. Juliana Lima
        </motion.h1>
        <div className="flex items-center gap-2 text-on-surface-variant font-medium">
          <MapPin size={18} className="text-primary" />
          <span>Rio de Janeiro, RJ • Private Clinic & Research Center</span>
        </div>
      </div>

      <div className="flex gap-3 shrink-0">
        <button className="bg-primary text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 active:scale-95">
          <UserPlus size={18} />
          <span>Enviar Convite</span>
        </button>
        <button className="bg-surface-container text-on-surface-variant font-bold py-4 px-8 rounded-2xl hover:bg-surface-container/60 transition-all flex items-center justify-center gap-2 active:scale-95">
          <Mail size={18} />
          <span>Contatar Profissional</span>
        </button>
      </div>
    </section>
  );
}

function ProfileDetails() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-surface-container/50"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
          <FileText size={22} />
        </div>
        <h2 className="text-2xl font-display font-extrabold">Perfil Profissional</h2>
      </div>

      <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg italic">
        <p>
          Especialista em distúrbios cognitivos e doenças neurodegenerativas com mais de 12 anos de experiência clínica. Dra. Juliana é reconhecida por sua abordagem integrativa no cuidado ao paciente, combinando tratamentos farmacológicos de ponta com intervenções no estilo de vida.
        </p>
        <p className="not-italic opacity-90">
          Atualmente Pesquisadora Líder no Instituto do Cérebro do Rio de Janeiro, ela é autora de mais de 40 artigos revisados por pares focados na detecção precoce de Alzheimer. Sua prática é construída sobre uma base de precisão clínica e comunicação empática, garantindo que tanto pacientes quanto suas famílias sejam apoiados em jornadas neurológicas complexas.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-12 pt-10 border-t border-surface-container">
        <div>
          <p className="text-[10px] uppercase font-black text-on-surface-variant/50 tracking-[0.2em] mb-2">
            Experiência
          </p>
          <p className="text-3xl font-display font-extrabold text-on-surface">14+ Anos</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-on-surface-variant/50 tracking-[0.2em] mb-2">
            Publicações
          </p>
          <p className="text-3xl font-display font-extrabold text-on-surface">42 Artigos Científicos</p>
        </div>
      </div>
    </motion.section>
  );
}

function StatsSidebar() {
  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/10 overflow-hidden relative"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

        <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
          <ShieldCheck size={20} />
          Status Verificado
        </h3>
        <ul className="space-y-4">
          {verifiedItems.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-3 text-sm bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm"
            >
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span className="font-medium leading-tight">{item}</span>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-surface-low border border-surface-container/50 p-8 rounded-[2.5rem]"
      >
        <h3 className="font-display font-bold text-sm text-on-surface mb-5 uppercase tracking-wide opacity-60">
          Áreas de Interesse
        </h3>
        <div className="flex flex-wrap gap-2">
          {interests.map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 bg-white border border-surface-container rounded-xl text-xs font-bold text-on-surface-variant hover:border-primary/30 transition-all cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

function EducationSectionComponent() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-surface-container/50"
    >
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
          <GraduationCap size={22} />
        </div>
        <h2 className="text-2xl font-display font-extrabold">Educação & Formação Clínica</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
        {education.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.05 }}
            className="flex gap-5 group"
          >
            <div className="bg-surface-low p-4 rounded-[1.25rem] h-fit group-hover:bg-primary/5 transition-colors duration-500">
              <item.icon size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-on-surface text-base mb-1">{item.title}</p>
              <p className="text-sm text-on-surface-variant font-medium mb-2">{item.school}</p>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant/40 tracking-widest leading-none">
                {item.years}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function InviteBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8 }}
      className="bg-surface-low p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-primary/5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

      <div className="flex items-center gap-8 relative z-10">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center rotate-3 border border-primary/10 shadow-sm transition-transform hover:rotate-0 duration-500">
          <Building2 className="text-primary" size={32} />
        </div>
        <div>
          <h3 className="text-2xl font-display font-extrabold mb-2 tracking-tight">
            Interessado em trabalhar com Dra. Juliana?
          </h3>
          <p className="text-on-surface-variant font-medium opacity-80 max-w-lg">
            Envie um convite para que ela possa atender pacientes e compartilhar relatórios dentro do PocketMed.
          </p>
        </div>
      </div>

      <button className="whitespace-nowrap bg-primary text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[0.98] transition-all relative z-10 active:scale-95">
        Enviar Convite
      </button>
    </motion.section>
  );
}

// --- Main Page ---

export default function DoctorProfile() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/doctors")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={20} />
          <span>Voltar para Médicos</span>
        </button>

        <ProfileHero />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProfileDetails />
          </div>
          <aside className="lg:col-span-1">
            <StatsSidebar />
          </aside>
        </div>

        <EducationSectionComponent />
        <InviteBanner />
      </div>
    </MainLayout>
  );
}
