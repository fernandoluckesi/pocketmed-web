import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Shield, Zap, Heart } from "lucide-react";

const banners = [
  {
    id: 1,
    icon: Sparkles,
    title: "Prontuário Integrado",
    subtitle: "O prontuário do paciente onde ele estiver",
    description: "Acesse o histórico completo do paciente em qualquer dispositivo. Consultas, exames, medicamentos e laudos — tudo sincronizado em tempo real entre médicos, clínicas e o próprio paciente.",
    cta: "Explorar",
  },
  {
    id: 2,
    icon: Zap,
    title: "Agendamento de Consultas",
    subtitle: "Pacientes agendam direto pelo app",
    description: "Seus pacientes visualizam horários disponíveis e agendam consultas sem precisar ligar. Confirmação automática, lembretes e reagendamento com um toque.",
    cta: "Ver Agenda",
  },
  {
    id: 3,
    icon: Shield,
    title: "Gestão de Clínica",
    subtitle: "Controle total da sua equipe médica",
    description: "Gerencie médicos, secretárias e permissões de acesso. Convide profissionais, defina papéis e acompanhe a produtividade da clínica em um painel centralizado.",
    cta: "Gerenciar",
  },
  {
    id: 4,
    icon: Heart,
    title: "Agenda Prática",
    subtitle: "Sua rotina clínica organizada visualmente",
    description: "Visualize consultas do dia, semana ou mês. Filtre por tipo de atendimento, veja conflitos de horário e otimize seu tempo entre pacientes presenciais e telemedicina.",
    cta: "Abrir Agenda",
  },
];

export function PromoBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const banner = banners[current];
  const Icon = banner.icon;

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-primary to-primary-container p-8 overflow-hidden transition-all duration-500">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-3xl -ml-16 -mb-16" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-start gap-5 flex-1">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm shrink-0">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{banner.title}</span>
            <h3 className="text-xl font-display font-extrabold text-white tracking-tight">
              {banner.subtitle}
            </h3>
            <p className="text-sm text-white/75 max-w-lg leading-relaxed">
              {banner.description}
            </p>
          </div>
        </div>

        <button className="shrink-0 bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-on-primary transition-all active:scale-95 shadow-lg shadow-primary/20">
          {banner.cta}
        </button>
      </div>

      {/* Navigation */}
      <div className="relative z-10 flex items-center justify-between mt-6">
        <div className="flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all border-none cursor-pointer ${
                idx === current ? "w-6 bg-white" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrent((current - 1 + banners.length) % banners.length)}
            className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border-none cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrent((current + 1) % banners.length)}
            className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border-none cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
