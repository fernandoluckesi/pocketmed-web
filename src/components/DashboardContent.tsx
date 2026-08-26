import { ICONS } from "../constants";
import { motion } from "motion/react";
import { PromoBanner } from "./PromoBanner";
import { useState, useEffect } from "react";
import { api } from "../services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

interface Appointment {
  id: string;
  dateTime: string;
  reason: string;
  status: string;
  isCompleted: boolean;
  patientId: string;
  doctorName: string;
  patient?: { name: string; profileImage?: string };
}

export const DashboardContent = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      const data = await api("/appointments");
      const appointments: Appointment[] = Array.isArray(data) ? data : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayList = appointments
        .filter((apt) => {
          const d = new Date(apt.dateTime);
          return d >= today && d < tomorrow;
        })
        .sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
        );

      const futureList = appointments
        .filter((apt) => {
          const d = new Date(apt.dateTime);
          return d >= tomorrow;
        })
        .sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
        )
        .slice(0, 10);

      setTodayAppointments(todayList);
      setUpcomingAppointments(futureList);
    } catch (err) {
      console.error("Erro ao carregar consultas:", err);
    } finally {
      setLoading(false);
    }
  }

  const completedToday = todayAppointments.filter((a) => a.isCompleted).length;
  const totalToday = todayAppointments.length;
  const progressPercent =
    totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  function formatTime(dateTime: string): { time: string; period: string } {
    const d = new Date(dateTime);
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const period = hours < 12 ? "AM" : "PM";
    return { time: `${hours.toString().padStart(2, "0")}:${minutes}`, period };
  }

  function formatDateLabel(dateTime: string): string {
    const d = new Date(dateTime);
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  // Group upcoming by date
  const upcomingGrouped: {
    date: string;
    label: string;
    appointments: Appointment[];
  }[] = [];
  for (const apt of upcomingAppointments) {
    const dateKey = new Date(apt.dateTime).toISOString().split("T")[0];
    const existing = upcomingGrouped.find((g) => g.date === dateKey);
    if (existing) {
      existing.appointments.push(apt);
    } else {
      upcomingGrouped.push({
        date: dateKey,
        label: formatDateLabel(apt.dateTime),
        appointments: [apt],
      });
    }
  }

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <PromoBanner />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Consultas de Hoje */}
        <motion.section
          variants={itemVariants}
          className="bg-slate-50 rounded-xl p-1 shadow-sm border border-slate-100 max-h-[520px] flex flex-col"
        >
          <div className="p-6 flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-on-surface tracking-tight font-manrope">
                Consultas de Hoje
              </h2>
              <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded">
                AO VIVO
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 mb-6">
              <h3 className="text-3xl font-bold text-on-surface font-manrope">
                {totalToday}
              </h3>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-4">
                <div
                  className="bg-primary h-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-2 font-medium">
                {completedToday} concluídas de {totalToday} total
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Carregando...
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhuma consulta hoje
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
                {todayAppointments.map((apt) => {
                  const { time, period } = formatTime(apt.dateTime);
                  const now = new Date();
                  const aptTime = new Date(apt.dateTime);
                  const isNow =
                    !apt.isCompleted &&
                    Math.abs(aptTime.getTime() - now.getTime()) <
                      30 * 60 * 1000;
                  const patientName = apt.patient?.name || "Paciente";

                  return (
                    <div
                      key={apt.id}
                      className={`flex items-center p-4 rounded-xl transition-all group cursor-pointer ${
                        isNow
                          ? "bg-white ring-2 ring-primary/40 shadow-lg relative"
                          : "bg-white hover:shadow-md"
                      }`}
                    >
                      {isNow && (
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-full"></div>
                      )}
                      <div className="w-16 flex-shrink-0 text-center border-r border-slate-100 mr-4">
                        <p className="text-xs font-black text-primary">
                          {time}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-medium">
                          {isNow ? "NOW" : period}
                        </p>
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-on-surface">
                          {patientName}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {apt.reason || "Consulta"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {apt.isCompleted && (
                          <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
                            Concluída
                          </span>
                        )}
                        {isNow && !apt.isCompleted && (
                          <span className="bg-blue-50 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                            Aguardando
                          </span>
                        )}
                        <ICONS.ChevronRight
                          size={14}
                          className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.section>

        {/* Próximas Consultas */}
        <motion.section
          variants={itemVariants}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 max-h-[520px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-extrabold text-on-surface tracking-tight font-manrope">
                Próximas Consultas
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                Agenda para os próximos dias
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Carregando...
            </div>
          ) : upcomingGrouped.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Nenhuma consulta agendada
            </div>
          ) : (
            <div className="space-y-6 overflow-y-auto flex-1 min-h-0">
              {upcomingGrouped.map((group) => (
                <div key={group.date}>
                  <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">
                    {group.label}
                  </p>
                  <div className="space-y-4">
                    {group.appointments.map((apt) => {
                      const { time } = formatTime(apt.dateTime);
                      const patientName = apt.patient?.name || "Paciente";
                      const initials = getInitials(patientName);

                      return (
                        <div
                          key={apt.id}
                          className="flex items-start space-x-4"
                        >
                          {apt.patient?.profileImage ? (
                            <img
                              alt={patientName}
                              className="w-10 h-10 rounded-full object-cover"
                              src={apt.patient.profileImage}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">
                              {initials}
                            </div>
                          )}
                          <div className="flex-grow pt-0.5">
                            <p className="text-sm font-bold text-on-surface">
                              {patientName}
                            </p>
                            <div className="flex items-center text-[10px] text-on-surface-variant mt-1">
                              <ICONS.Clock size={12} className="mr-1" /> {time}
                              <span className="mx-2 text-slate-300">
                                •
                              </span>{" "}
                              {apt.reason || "Consulta"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
};
