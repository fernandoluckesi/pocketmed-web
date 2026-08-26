import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  CalendarCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";
import { NewAppointmentModal } from "../../components/NewAppointmentModal";
import { AppointmentDetailModal } from "../../components/AppointmentDetailModal";
import { MainLayout } from "../../components/MainLayout";
import { Button } from "../../components/ui/Button";
import { api } from "../../services/api";

// --- API Data Hook ---

interface APIAppointment {
  id: string;
  dateTime: string;
  reason: string;
  status: string;
  isCompleted: boolean;
  patient?: { name: string; profileImage?: string };
  doctorName?: string;
}

function useScheduleAppointments() {
  const [appointments, setAppointments] = useState<APIAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api("/appointments");
      setAppointments(Array.isArray(data) ? data : []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = appointments
    .filter((a) => {
      const d = new Date(a.dateTime);
      return d >= today && d < tomorrow;
    })
    .sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );

  const upcomingAppointments = appointments
    .filter((a) => {
      return new Date(a.dateTime) >= tomorrow;
    })
    .sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );

  const completedToday = todayAppointments.filter((a) => a.isCompleted).length;

  return {
    appointments,
    todayAppointments,
    upcomingAppointments,
    completedToday,
    loading,
    refetch: load,
  };
}

// --- Types ---

// --- Mock Data ---

// --- Day View Data ---

// --- Sidebar ---
// --- Day View (Dynamic) ---

function DayView({
  selectedDate,
  setSelectedDate,
  appointments,
}: {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  appointments: APIAppointment[];
}) {
  const dayStart = new Date(selectedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(selectedDate);
  dayEnd.setHours(23, 59, 59, 999);

  const dayAppts = appointments
    .filter((a) => {
      const d = new Date(a.dateTime);
      return d >= dayStart && d <= dayEnd;
    })
    .sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );

  function prevDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  }
  function nextDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  }
  function goToday() {
    setSelectedDate(new Date());
  }

  const dateLabel = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-slate-500 font-medium">
            Agenda do dia: {dateLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevDay}
            className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 transition-all cursor-pointer border-none"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <button
            onClick={goToday}
            className="px-5 py-2 bg-slate-200/50 hover:bg-slate-200 rounded-lg font-bold text-sm text-slate-700 transition-all cursor-pointer border-none"
          >
            Hoje
          </button>
          <button
            onClick={nextDay}
            className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 transition-all cursor-pointer border-none"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        {dayAppts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium text-lg">Nenhuma consulta neste dia</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dayAppts.map((apt) => {
              const d = new Date(apt.dateTime);
              const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
              const patientName = apt.patient?.name || "Paciente";

              return (
                <div
                  key={apt.id}
                  className="flex items-center p-5 hover:bg-slate-50 transition-all group"
                >
                  <div className="w-20 flex-shrink-0 text-center border-r border-slate-100 mr-5">
                    <p className="text-sm font-black text-primary">{time}</p>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-slate-900">
                      {patientName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {apt.reason || "Consulta"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${apt.isCompleted ? "bg-green-100 text-green-700" : "bg-blue-100 text-primary"}`}
                  >
                    {apt.isCompleted ? "Concluída" : "Agendada"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Week View (Dynamic) ---

function WeekView({
  selectedDate,
  onDayClick,
  appointments,
  onWeekChange,
}: {
  selectedDate: Date;
  onDayClick: (d: Date) => void;
  appointments: APIAppointment[];
  onWeekChange: (d: Date) => void;
}) {
  const startOfWeek = new Date(selectedDate);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1); // Monday

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    onWeekChange(d);
  };

  const nextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    onWeekChange(d);
  };

  const goThisWeek = () => {
    onWeekChange(new Date());
  };

  const weekLabel = `${startOfWeek.getDate()} de ${startOfWeek.toLocaleDateString("pt-BR", { month: "long" })} — ${endOfWeek.getDate()} de ${endOfWeek.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`;

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-slate-500 font-medium">Semana: {weekLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevWeek}
            className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 transition-all cursor-pointer border-none"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <button
            onClick={goThisWeek}
            className="px-5 py-2 bg-slate-200/50 hover:bg-slate-200 rounded-lg font-bold text-sm text-slate-700 transition-all cursor-pointer border-none"
          >
            Semana atual
          </button>
          <button
            onClick={nextWeek}
            className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 transition-all cursor-pointer border-none"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
      >
        <div className="grid grid-cols-7 border-b border-slate-100">
          {weekDays.map((d, i) => {
            const isToday = d.getTime() === today.getTime();
            return (
              <div
                key={i}
                onClick={() => onDayClick(d)}
                className={`py-4 text-center cursor-pointer hover:bg-primary/5 transition-colors ${isToday ? "bg-primary/5" : ""}`}
              >
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  {d.toLocaleDateString("pt-BR", { weekday: "short" })}
                </p>
                <p
                  className={`text-lg font-bold mt-1 ${isToday ? "text-primary" : "text-slate-900"}`}
                >
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-7 min-h-[400px]">
          {weekDays.map((day, i) => {
            const dayStart = new Date(day);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(day);
            dayEnd.setHours(23, 59, 59);
            const dayAppts = appointments
              .filter((a) => {
                const ad = new Date(a.dateTime);
                return ad >= dayStart && ad <= dayEnd;
              })
              .sort(
                (a, b) =>
                  new Date(a.dateTime).getTime() -
                  new Date(b.dateTime).getTime(),
              );

            return (
              <div
                key={i}
                className="border-r border-slate-100 last:border-r-0 p-2 space-y-2"
              >
                {dayAppts.map((apt) => {
                  const ad = new Date(apt.dateTime);
                  const time = `${ad.getHours().toString().padStart(2, "0")}:${ad.getMinutes().toString().padStart(2, "0")}`;
                  return (
                    <div
                      key={apt.id}
                      onClick={() => onDayClick(day)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold truncate cursor-pointer transition-all hover:shadow-sm ${
                        apt.isCompleted
                          ? "bg-green-50 border-l-2 border-green-500 text-green-700"
                          : "bg-primary/5 border-l-2 border-primary text-primary"
                      }`}
                    >
                      {time} {apt.patient?.name?.split(" ")[0] || ""}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// --- Stat Card ---

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-[2rem] flex items-center gap-6 border border-slate-100 shadow-sm grow"
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}
      >
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
          {label}
        </p>
        <h4 className="text-2xl font-display font-extrabold text-slate-900">
          {value}
        </h4>
      </div>
    </motion.div>
  );
}

// --- Day View ---

// --- Calendar View (Dynamic) ---

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function CalendarView({
  appointments,
  onAppointmentClick,
  onDayClick,
}: {
  appointments: APIAppointment[];
  onAppointmentClick: (apt: any) => void;
  onDayClick?: (d: Date) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else setCurrentMonth(currentMonth - 1);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
  }

  // Generate calendar days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: {
    day: number;
    month: "prev" | "current" | "next";
    isToday: boolean;
  }[] = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: "prev",
      isToday: false,
    });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      month: "current",
      isToday:
        i === todayDay &&
        currentMonth === todayMonth &&
        currentYear === todayYear,
    });
  }
  // Next month days (fill to 42)
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, month: "next", isToday: false });
  }

  // Map appointments to days
  function getAppointmentsForDay(day: number): APIAppointment[] {
    return appointments.filter((a) => {
      const d = new Date(a.dateTime);
      return (
        d.getDate() === day &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });
  }

  function formatTime(dateTime: string): string {
    const d = new Date(dateTime);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-100/50 rounded-[2.5rem] p-8 border border-white/80 backdrop-blur-md shadow-sm"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-6">
          <h3 className="text-2xl font-display font-bold text-slate-900">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-4 bg-white/50 px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" /> Agendada
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Concluída
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div
              key={d}
              className="py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((item, idx) => {
            const dayAppts =
              item.month === "current" ? getAppointmentsForDay(item.day) : [];
            return (
              <div
                key={idx}
                onClick={() =>
                  item.month === "current" &&
                  onDayClick?.(new Date(currentYear, currentMonth, item.day))
                }
                className={`h-32 p-3 border-r border-b border-slate-100 last:border-r-0 relative transition-all cursor-pointer
                  ${item.month !== "current" ? "bg-slate-50/50 opacity-40" : "hover:bg-primary/[0.02]"}
                  ${item.isToday ? "bg-primary/[0.03]" : ""}`}
              >
                {item.isToday && (
                  <div className="absolute top-3 right-3">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse inline-block" />
                  </div>
                )}
                <span
                  className={`text-xs font-bold ${item.isToday ? "text-primary" : "text-slate-900"} ${item.month !== "current" ? "text-slate-400" : ""}`}
                >
                  {item.day}
                </span>

                <div className="mt-2 space-y-1 overflow-hidden">
                  {dayAppts.slice(0, 3).map((appt) => (
                    <div
                      key={appt.id}
                      onClick={() =>
                        onAppointmentClick({
                          id: appt.id,
                          patientName: appt.patient?.name || "Paciente",
                          doctorName: appt.doctorName || "",
                          type: appt.reason || "Consulta",
                          dateTime: new Date(appt.dateTime).toLocaleString(
                            "pt-BR",
                          ),
                          status: appt.isCompleted ? "Concluída" : "Agendada",
                        })
                      }
                      className={`px-2 py-1 rounded text-[9px] font-bold truncate cursor-pointer transition-all hover:shadow-sm ${
                        appt.isCompleted
                          ? "bg-green-50 border-l-2 border-green-500 text-green-700"
                          : "bg-primary/5 border-l-2 border-primary text-primary"
                      }`}
                    >
                      {formatTime(appt.dateTime)}{" "}
                      {appt.patient?.name?.split(" ")[0] || ""}
                    </div>
                  ))}
                  {dayAppts.length > 3 && (
                    <span className="text-[9px] text-slate-400 font-medium">
                      +{dayAppts.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Page ---

export default function Schedule() {
  const [viewMode, setViewMode] = useState<"Dia" | "Semana" | "Mês">("Mês");
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const {
    todayAppointments,
    upcomingAppointments,
    completedToday,
    appointments: allAppointments,
  } = useScheduleAppointments();
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    patientName: string;
    doctorName: string;
    type: string;
    dateTime: string;
    status: string;
  } | null>(null);

  const handleAppointmentClick = (appointment: {
    id: string;
    patientName: string;
    doctorName: string;
    type: string;
    dateTime: string;
    status: string;
  }) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetail(true);
  };

  return (
    <MainLayout>
      <div>
        {/* Agenda Content */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                Agenda Médica
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex space-x-1 p-1 bg-white rounded-2xl w-fit shadow-sm border border-gray-100">
                {(["Dia", "Semana", "Mês"] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setViewMode(view)}
                    className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                      view === viewMode
                        ? "bg-primary/5 text-primary"
                        : "text-gray-500 hover:text-gray-800 bg-transparent"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setShowNewAppointment(true)}
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
              >
                Novo Agendamento
              </Button>
            </div>
          </div>

          {/* View Content */}
          {viewMode === "Dia" ? (
            <DayView
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              appointments={allAppointments}
            />
          ) : viewMode === "Semana" ? (
            <WeekView
              selectedDate={selectedDate}
              onDayClick={(d: Date) => {
                setSelectedDate(d);
                setViewMode("Dia");
              }}
              onWeekChange={(d: Date) => setSelectedDate(d)}
              appointments={allAppointments}
            />
          ) : (
            <>
              {/* Calendar Box - Dynamic */}
              <CalendarView
                appointments={allAppointments}
                onAppointmentClick={handleAppointmentClick}
                onDayClick={(d: Date) => {
                  setSelectedDate(d);
                  setViewMode("Dia");
                }}
              />

              {/* Stats Bar */}
              <div className="mt-8 flex gap-6">
                <StatCard
                  icon={CalendarCheck}
                  label="Consultas Hoje"
                  value={`${todayAppointments.length} agendadas`}
                  colorClass="bg-primary/10 text-primary"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Concluídas"
                  value={`${completedToday} de ${todayAppointments.length}`}
                  colorClass="bg-green-50 text-green-600"
                />
                <StatCard
                  icon={FileText}
                  label="Próximas"
                  value={`${upcomingAppointments.length} agendadas`}
                  colorClass="bg-secondary/10 text-secondary"
                />
              </div>
            </>
          )}
        </section>

        <NewAppointmentModal
          isOpen={showNewAppointment}
          onClose={() => setShowNewAppointment(false)}
        />
        <AppointmentDetailModal
          isOpen={showAppointmentDetail}
          onClose={() => setShowAppointmentDetail(false)}
          appointment={selectedAppointment}
        />
      </div>
    </MainLayout>
  );
}
