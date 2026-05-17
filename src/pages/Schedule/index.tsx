import { useState } from "react";
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

// --- Types ---

interface Appointment {
  id: string;
  time: string;
  patient: string;
  type: "routine" | "priority" | "post-op";
}

interface CalendarDay {
  day: number;
  month: "current" | "prev" | "next";
  appointments: Appointment[];
  isToday?: boolean;
}

// --- Mock Data ---

const days: CalendarDay[] = [
  { day: 29, month: "prev", appointments: [] },
  { day: 30, month: "prev", appointments: [] },
  { day: 1, month: "current", appointments: [] },
  {
    day: 2,
    month: "current",
    appointments: [
      { id: "1", time: "09:00", patient: "Ricardo S.", type: "routine" },
    ],
  },
  { day: 3, month: "current", appointments: [] },
  {
    day: 4,
    month: "current",
    appointments: [
      { id: "2", time: "14:30", patient: "Ana Paula", type: "post-op" },
    ],
  },
  { day: 5, month: "current", appointments: [] },
  { day: 6, month: "current", appointments: [] },
  {
    day: 7,
    month: "current",
    appointments: [
      { id: "3", time: "08:00", patient: "Carlos M.", type: "routine" },
      { id: "4", time: "10:15", patient: "Julia V.", type: "priority" },
    ],
  },
  { day: 8, month: "current", appointments: [] },
  {
    day: 9,
    month: "current",
    isToday: true,
    appointments: [
      { id: "5", time: "11:00", patient: "Mariana F.", type: "routine" },
      { id: "6", time: "13:00", patient: "Dr. Pedro", type: "priority" },
      { id: "7", time: "16:45", patient: "Luis G.", type: "post-op" },
    ],
  },
  { day: 10, month: "current", appointments: [] },
  { day: 11, month: "current", appointments: [] },
  { day: 12, month: "current", appointments: [] },
  { day: 13, month: "current", appointments: [] },
  { day: 14, month: "current", appointments: [] },
  {
    day: 15,
    month: "current",
    appointments: [
      { id: "8", time: "09:00", patient: "Urgent: Roberto", type: "priority" },
    ],
  },
  { day: 16, month: "current", appointments: [] },
  { day: 17, month: "current", appointments: [] },
  { day: 18, month: "current", appointments: [] },
  { day: 19, month: "current", appointments: [] },
  { day: 20, month: "current", appointments: [] },
  { day: 21, month: "current", appointments: [] },
  {
    day: 22,
    month: "current",
    appointments: [
      { id: "9", time: "10:00", patient: "Sofia L.", type: "post-op" },
    ],
  },
  { day: 23, month: "current", appointments: [] },
  { day: 24, month: "current", appointments: [] },
  { day: 25, month: "current", appointments: [] },
  { day: 26, month: "current", appointments: [] },
];

// --- Day View Data ---

const dayAppointments = [
  {
    id: "1",
    time: "08:30 — 09:45",
    title: "Weekly Department Review",
    subtitle: "Conference Room B • 4 Attendees",
    category: "Rotina" as const,
    top: 100,
    height: 120,
    color: "blue" as const,
  },
  {
    id: "2",
    time: "10:15 — 11:45",
    title: "Patient: Sarah Jenkins",
    subtitle: "Cardiology Consultation • New Patient",
    category: "Prioridade" as const,
    top: 280,
    height: 160,
    color: "indigo" as const,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBzPh4WOOTDs4bCcy28YWOpKzRyv7Z_gWhfMoh4jVlZWZIEhWwF518gt_RTHTRW2ra0zLM1If0bGM6j0dVgBndnxd1017KNa0DVz-UNrwAgr3IxuMHAvN9wAB5lMpGETNa7Q-M420UAn5ZBZjhOoG3omxFvWmEc111luZZpd4lzPKDYEArJ-zzLY-JymFBpxDv9BOjrDgIUxoPilF83pKcgkLtyzN2n_1ZKExJAaDxIy6uO5ocsVyTkVWS-XeWxy1pTpyQSwUqkQuts",
    attachment: "Lab_Results_SJ.pdf",
  },
  {
    id: "3",
    time: "13:30 — 15:00",
    title: "Robert Miller - Follow Up",
    subtitle: "Knee Replacement Recovery • Room 402",
    category: "Pós-Op" as const,
    top: 600,
    height: 160,
    color: "orange" as const,
    info: "Reviewing physical therapy progress",
  },
  {
    id: "4",
    time: "16:30 — 17:30",
    title: "Telehealth: Marcella Rossi",
    subtitle: "General Checkup • Link sent",
    category: "Rotina" as const,
    top: 850,
    height: 100,
    color: "blue" as const,
  },
];

const timelineHours = Array.from(
  { length: 11 },
  (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`,
);

// --- Sidebar ---
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

function DayView() {
  return (
    <div className="flex flex-1 gap-0">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-extrabold text-blue-900 tracking-tight">
              Today's Agenda
            </h2>
            <p className="text-slate-500 font-medium">
              Monday, October 24, 2023
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 transition-all">
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <button className="px-5 py-2 bg-slate-200/50 hover:bg-slate-200 rounded-lg font-bold text-sm text-slate-700 transition-all">
              Today
            </button>
            <button className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 transition-all">
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden flex shadow-sm border border-slate-100 min-h-[1100px]">
          {/* Time Column */}
          <div className="w-20 bg-slate-50/50 border-r border-slate-100 flex-shrink-0 pt-10">
            {timelineHours.map((hour) => (
              <div
                key={hour}
                className="h-24 px-4 flex justify-end items-start text-[11px] font-bold text-slate-400 uppercase tracking-tighter"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Timeline Canvas */}
          <div className="flex-1 relative bg-white">
            {/* Hour Grid Lines */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              {timelineHours.map((_, i) => (
                <div
                  key={i}
                  className="h-24 border-b border-slate-100/50 w-full"
                />
              ))}
            </div>

            {/* Current Time Indicator */}
            <div className="absolute w-full top-[312px] flex items-center z-10 pointer-events-none">
              <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 ring-4 ring-white shadow-sm" />
              <div className="h-0.5 flex-1 bg-red-200" />
              <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm ml-2 mr-4">
                11:15
              </div>
            </div>

            {/* Appointments */}
            <div className="absolute inset-0 p-4">
              {dayAppointments.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className={`absolute left-8 right-8 rounded-r-xl border-l-4 p-4 flex flex-col justify-between transition-colors shadow-sm cursor-pointer ${
                    app.color === "blue"
                      ? "bg-blue-50/80 border-blue-600 hover:bg-blue-50"
                      : app.color === "indigo"
                        ? "bg-indigo-50/80 border-indigo-600 hover:bg-indigo-50"
                        : "bg-orange-50/80 border-orange-500 hover:bg-orange-50"
                  }`}
                  style={{ top: `${app.top}px`, height: `${app.height}px` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            app.color === "blue"
                              ? "text-blue-700"
                              : app.color === "indigo"
                                ? "text-indigo-700"
                                : "text-orange-700"
                          }`}
                        >
                          {app.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {app.time}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-slate-900">
                        {app.title}
                      </h4>
                      <p className="text-xs text-slate-500">{app.subtitle}</p>
                    </div>
                    {app.avatar && (
                      <img
                        src={app.avatar}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    {app.attachment && (
                      <span className="bg-white text-[10px] font-bold py-1 px-3 rounded-full border border-slate-100 flex items-center gap-1 text-slate-600">
                        📎 {app.attachment}
                      </span>
                    )}
                    {app.info && (
                      <span className="text-xs font-medium text-orange-700 flex items-center gap-1">
                        🕐 {app.info}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l border-slate-200 p-6 flex-col gap-8 hidden xl:flex">
        {/* Daily Progress */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-display font-extrabold text-slate-900 mb-6">
            Daily Load
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Appointments</span>
                <span className="text-blue-600">12/15</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Remaining
                </p>
                <p className="text-2xl font-display font-extrabold text-blue-600">
                  3
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Completed
                </p>
                <p className="text-2xl font-display font-extrabold text-indigo-600">
                  9
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
            Categories
          </h3>
          <div className="space-y-2">
            {[
              { label: "Rotina", color: "bg-blue-400" },
              { label: "Prioridade", color: "bg-indigo-500" },
              { label: "Pós-Op", color: "bg-orange-500" },
            ].map((cat) => (
              <div
                key={cat.label}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group border border-transparent hover:border-slate-200"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${cat.color} group-hover:scale-125 transition-transform`}
                />
                <span className="text-sm font-bold text-slate-700">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tip */}
        <div className="mt-auto">
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <h4 className="font-display font-bold mb-3 flex items-center gap-2">
              💡 Pro Tip
            </h4>
            <p className="text-xs text-blue-50 leading-relaxed opacity-90">
              You have a 15-minute gap between{" "}
              <span className="font-bold underline">Jenkins</span> and your
              lunch break. Perfect for completing medical reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Week View Data ---

type WeekAppointment = {
  id: string;
  patientName: string;
  type: string;
  description: string;
  startTime: string; // "HH:mm"
  duration: number; // minutes
  day: number; // 0-6 (Mon-Sun mapped to displayed days)
  color: "blue" | "indigo" | "orange" | "slate" | "green";
};

const WEEK_DAYS = [
  { name: "Mon", date: "07" },
  { name: "Tue", date: "08", isToday: true },
  { name: "Wed", date: "09" },
  { name: "Thu", date: "10" },
  { name: "Fri", date: "11" },
];

const WEEK_TIME_SLOTS = Array.from({ length: 11 }, (_, i) => {
  const hour = i + 8;
  return `${String(hour).padStart(2, "0")}:00`;
});

const WEEK_APPOINTMENTS: WeekAppointment[] = [
  {
    id: "w1",
    patientName: "Ricardo Santos",
    type: "CONSULTA",
    description: "Check-up Geral",
    startTime: "09:00",
    duration: 90,
    day: 0,
    color: "blue",
  },
  {
    id: "w2",
    patientName: "Ana Paula Costa",
    type: "ROTINA",
    description: "10:00 - 10:45",
    startTime: "10:00",
    duration: 45,
    day: 1,
    color: "slate",
  },
  {
    id: "w3",
    patientName: "Mariana Ferreira",
    type: "URGENTE",
    description: "Cardiologia de Emergência",
    startTime: "12:00",
    duration: 90,
    day: 1,
    color: "orange",
  },
  {
    id: "w4",
    patientName: "Carlos Mendes",
    type: "RETORNO",
    description: "Acompanhamento Pós-Op",
    startTime: "14:00",
    duration: 60,
    day: 2,
    color: "green",
  },
  {
    id: "w5",
    patientName: "Julia Vieira",
    type: "RESULTADOS",
    description: "Resultados de Exames",
    startTime: "09:00",
    duration: 75,
    day: 3,
    color: "indigo",
  },
  {
    id: "w6",
    patientName: "Pedro Almeida",
    type: "EXAME",
    description: "Exame de Imagem",
    startTime: "13:00",
    duration: 60,
    day: 4,
    color: "slate",
  },
  {
    id: "w7",
    patientName: "Sofia Lima",
    type: "CONSULTA",
    description: "Consulta Dermatológica",
    startTime: "15:30",
    duration: 45,
    day: 3,
    color: "blue",
  },
  {
    id: "w8",
    patientName: "Luis Garcia",
    type: "RETORNO",
    description: "Revisão de Medicação",
    startTime: "11:00",
    duration: 30,
    day: 4,
    color: "green",
  },
];

function WeekAppointmentCard({ appointment }: { appointment: WeekAppointment }) {
  const [startHour, startMin] = appointment.startTime.split(":").map(Number);
  const topOffset = (startHour - 8) * 88 + (startMin / 60) * 88;
  const height = (appointment.duration / 60) * 88;

  const colorClasses = {
    blue: "bg-primary/10 border-l-primary text-primary",
    indigo: "bg-indigo-50 border-l-indigo-500 text-indigo-700",
    orange: "bg-orange-50 border-l-orange-500 text-orange-700",
    slate: "bg-slate-100 border-l-slate-400 text-slate-700",
    green: "bg-emerald-50 border-l-emerald-500 text-emerald-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`absolute left-1 right-1 rounded-xl border-l-4 p-3 shadow-sm cursor-pointer transition-all z-10 ${colorClasses[appointment.color]}`}
      style={{ top: `${topOffset}px`, height: `${height}px` }}
    >
      <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
        {appointment.type}
      </span>
      <p className="font-display font-bold text-sm leading-tight mt-1 truncate">
        {appointment.patientName}
      </p>
      {height > 60 && (
        <p className="opacity-60 text-[10px] font-medium mt-1 truncate">
          {appointment.description}
        </p>
      )}
    </motion.div>
  );
}

function WeekView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Week Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Weekly Schedule
          </h2>
          <p className="text-slate-500 font-medium">October 7 – 11, 2024</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 transition-all">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <button className="px-5 py-2 bg-slate-200/50 hover:bg-slate-200 rounded-lg font-bold text-sm text-slate-700 transition-all">
            Today
          </button>
          <button className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 transition-all">
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden border border-slate-100">
        {/* Grid Header — Days */}
        <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-slate-50/50 border-b border-slate-100">
          <div className="p-4"></div>
          {WEEK_DAYS.map((day, idx) => (
            <div
              key={idx}
              className={`p-5 text-center transition-colors ${day.isToday ? "bg-primary/5" : ""}`}
            >
              <p
                className={`text-[10px] font-bold uppercase tracking-widest ${day.isToday ? "text-primary" : "text-slate-400"}`}
              >
                {day.name}
              </p>
              <p
                className={`text-2xl font-display font-extrabold mt-1 ${day.isToday ? "text-primary" : "text-slate-900"}`}
              >
                {day.date}
              </p>
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="relative h-[968px] overflow-y-auto">
          <div className="grid grid-cols-[80px_repeat(5,1fr)] min-h-[968px] relative">
            {/* Time Slots Labels */}
            <div className="flex flex-col text-right pr-4 pt-8 text-[10px] font-bold text-slate-400 uppercase tracking-tighter gap-[70px] border-r border-slate-100">
              {WEEK_TIME_SLOTS.map((time, idx) => (
                <span key={idx}>{time}</span>
              ))}
            </div>

            {/* Day Columns */}
            {WEEK_DAYS.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`relative border-r border-slate-100 p-1 h-full ${day.isToday ? "bg-primary/[0.02]" : ""}`}
              >
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  {WEEK_TIME_SLOTS.map((_, i) => (
                    <div key={i} className="h-[88px] border-b border-slate-100/50" />
                  ))}
                </div>

                {/* Today Line Indicator */}
                {day.isToday && (
                  <div className="absolute top-[280px] left-0 right-0 h-0.5 bg-primary z-20 pointer-events-none">
                    <div className="absolute -left-1 -top-[3px] w-2 h-2 bg-primary rounded-full shadow-sm shadow-primary/40"></div>
                  </div>
                )}

                {/* Appointments for this day */}
                {WEEK_APPOINTMENTS.filter((a) => a.day === dayIdx).map((appt) => (
                  <WeekAppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-8 flex gap-6">
        <StatCard
          icon={CalendarCheck}
          label="Total Appts"
          value="24 This Week"
          colorClass="bg-primary/10 text-primary"
        />
        <StatCard
          icon={AlertCircle}
          label="Priority Cases"
          value="03 High"
          colorClass="bg-priority/10 text-priority"
        />
        <StatCard
          icon={FileText}
          label="Post-Op Reviews"
          value="08 Scheduled"
          colorClass="bg-secondary/10 text-secondary"
        />
      </div>
    </motion.div>
  );
}

// --- Main Page ---

export default function Schedule() {
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Month");
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
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
              <nav className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                <span>Management</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary">Agenda Médica</span>
              </nav>
              <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                Agenda Médica
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-1 bg-slate-100 rounded-full flex gap-1">
                {(["Day", "Week", "Month"] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setViewMode(view)}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      view === viewMode
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowNewAppointment(true)}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
                Novo Agendamento
              </button>
            </div>
          </div>

          {/* View Content */}
          {viewMode === "Day" ? (
            <DayView />
          ) : viewMode === "Week" ? (
            <WeekView />
          ) : (
            <>
              {/* Calendar Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-100/50 rounded-[2.5rem] p-8 border border-white/80 backdrop-blur-md shadow-sm"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-6">
                    <h3 className="text-2xl font-display font-bold text-slate-900">
                      October 2024
                    </h3>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 bg-white/50 px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />{" "}
                      Routine
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-priority" />{" "}
                      Priority
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary" />{" "}
                      Post-Op
                    </div>
                  </div>
                </div>

                {/* Grid */}
                <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
                  <div className="grid grid-cols-7 border-b border-slate-100">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
                        >
                          {day}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="grid grid-cols-7">
                    {days.map((item, idx) => (
                      <div
                        key={idx}
                        className={`h-44 p-4 border-r border-b border-slate-100 last:border-r-0 relative group transition-all
                      ${item.month !== "current" ? "bg-slate-50/50 opacity-40" : "hover:bg-primary/[0.02]"}
                      ${item.isToday ? "bg-primary/[0.03]" : ""}`}
                      >
                        {item.isToday && (
                          <div className="absolute top-4 right-4 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,64,205,0.4)]" />
                          </div>
                        )}
                        <span
                          className={`text-sm font-bold ${item.isToday ? "text-primary" : "text-slate-900"} ${item.month !== "current" ? "text-slate-400" : ""}`}
                        >
                          {item.day}
                        </span>

                        <div className="mt-4 space-y-2">
                          {item.appointments.map((appt) => (
                            <motion.div
                              key={appt.id}
                              onClick={() => handleAppointmentClick({
                                id: appt.id,
                                patientName: appt.patient,
                                doctorName: 'Dr. Roberto Silva',
                                type: appt.type === 'routine' ? 'Rotina' : appt.type === 'priority' ? 'Prioridade' : 'Pós-Op',
                                dateTime: `${item.day} Out 2024, ${appt.time}`,
                                status: 'Confirmado',
                              })}
                              className={`px-3 py-1.5 rounded-lg border-l-2 text-[10px] font-bold truncate transition-all cursor-pointer hover:shadow-md
                            ${
                              appt.type === "routine"
                                ? "bg-primary/5 border-primary text-primary hover:bg-primary/10"
                                : appt.type === "priority"
                                  ? "bg-priority/5 border-priority text-priority hover:bg-priority/10"
                                  : "bg-secondary/5 border-secondary text-secondary hover:bg-secondary/10"
                            }`}
                            >
                              {item.isToday &&
                              appt.type === "routine" &&
                              appt.id === "5" ? (
                                <div className="bg-primary text-white -mx-3 -my-1.5 px-3 py-1.5 rounded-lg">
                                  {appt.time} - {appt.patient}
                                </div>
                              ) : (
                                <span>
                                  {appt.time} - {appt.patient}
                                </span>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Stats Bar */}
              <div className="mt-8 flex gap-6">
                <StatCard
                  icon={CalendarCheck}
                  label="Total Appts"
                  value="24 Today"
                  colorClass="bg-primary/10 text-primary"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Priority Cases"
                  value="03 High"
                  colorClass="bg-priority/10 text-priority"
                />
                <StatCard
                  icon={FileText}
                  label="Post-Op Reviews"
                  value="08 Scheduled"
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
