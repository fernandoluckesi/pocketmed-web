import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  Users,
  HeartPulse,
  UserCircle,
  CreditCard,
  LogOut,
  Plus,
  Search,
  Bell,
  Settings,
  ChevronRight,
  ChevronLeft,
  CalendarCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";

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

function ScheduleSidebar() {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Patients", path: "/patients" },
    { icon: Stethoscope, label: "Doctors", path: "/doctors" },
    { icon: CalendarDays, label: "Schedule", path: "/schedule" },
    {
      icon: HeartPulse,
      label: "Clinical Management",
      path: "/clinical-management",
    },
  ];

  const personalItems = [
    { icon: UserCircle, label: "My Account", path: "/account" },
    { icon: CreditCard, label: "Plans", path: "/plans" },
  ];

  return (
    <aside className="w-72 bg-sidebar border-r border-slate-200 flex flex-col py-8 sticky top-0 h-screen">
      <div className="px-8 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-primary leading-tight">
              PocketMed
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Clinical Excellence
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 pr-4">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 relative group
                ${
                  active
                    ? "text-primary font-bold bg-white/50 rounded-r-3xl"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 hover:rounded-r-3xl"
                }`}
            >
              {active && (
                <div className="absolute left-0 w-1 h-6 bg-primary rounded-full" />
              )}
              <item.icon
                className={`w-5 h-5 ${active ? "fill-primary/10" : ""}`}
              />
              <span className="text-sm tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-6 space-y-6">
        <div className="pt-6 border-t border-slate-200 space-y-1">
          {personalItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-3 w-full transition-colors text-sm
                  ${active ? "text-primary font-bold" : "text-slate-500 hover:text-primary"}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <button className="flex items-center gap-4 px-6 py-3 w-full text-slate-500 hover:text-rose-600 transition-colors text-sm">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
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

// --- Main Page ---

export default function Schedule() {
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Month");

  return (
    <div className="flex min-h-screen bg-surface">
      <ScheduleSidebar />

      <main className="flex-1 p-8">
        {/* Top Navbar */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center bg-slate-200/50 rounded-full px-5 py-2.5 gap-3 w-96 border border-white/50 backdrop-blur-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search records..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-full hover:bg-slate-100 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2.5 rounded-full hover:bg-slate-100 transition-colors">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS6Y0zlHGFAdYKiQwLxbZ0y6zVPUrmmM4aCJg55w-lhQNb6ZNTUWVwYi79YSnxijWgoz6LtWBW7XHdblgvmeggklStEb4SUNHYYeQMbOXv60Gd2hdjo7ateMTji-wwZUhAJPLZG2W1SKIPNUAyOFv4lTVIejjnLyXgPDlGd9EIaEOv1sQ1qb9NhYrYOryUewbcF84a4ElAbq1n4lvFZJ0uR8gEJD6y619R-ZOstNQyRQmfGDlprwpaBalGrhWiT7bYpNsh1u1X8E6i"
                  alt="Doctor Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

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
              <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                <Plus className="w-5 h-5" />
                Novo Agendamento
              </button>
            </div>
          </div>

          {/* View Content */}
          {viewMode === "Day" ? (
            <DayView />
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
      </main>
    </div>
  );
}
