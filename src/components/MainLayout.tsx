import { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ICONS, IMAGES } from "../constants";
import {
  Search,
  Bell,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: ICONS.Dashboard, label: "Dashboard", path: "/dashboard" },
  { icon: ICONS.Patients, label: "Patients", path: "/patients" },
  { icon: ICONS.Doctors, label: "Doctors", path: "/doctors" },
  { icon: ICONS.Schedule, label: "Schedule", path: "/schedule" },
  { icon: ICONS.Management, label: "Clinical Management", path: "/clinical-management" },
];

const personalItems = [
  { icon: ICONS.Account, label: "My Account", path: "/account" },
  { icon: ICONS.Plans, label: "Plans", path: "/plans" },
];

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-surface text-on-surface">
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 flex flex-col p-6 space-y-8 z-50">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ICONS.Doctors size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-primary tracking-tight font-manrope">
              PocketMed
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
              Clinical Excellence
            </p>
          </div>
        </div>

        <nav className="flex-grow space-y-1">
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div key={idx} whileHover={{ x: 4 }}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-full transition-all duration-200 font-manrope text-sm font-semibold ${
                    isActive
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-600 hover:text-primary hover:bg-slate-200"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}

          <div className="pt-6 pb-2 px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
              Personal
            </p>
          </div>

          {personalItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div key={idx} whileHover={{ x: 4 }}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-full transition-all duration-200 font-manrope text-sm font-semibold ${
                    isActive
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-600 hover:text-primary hover:bg-slate-200"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200/50 pt-4">
          <a
            className="flex items-center space-x-3 px-4 py-3 text-error hover:bg-error-container/20 transition-all rounded-full font-manrope text-sm font-semibold cursor-pointer"
            href="#"
          >
            <ICONS.Logout size={18} />
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-grow flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-8 py-4">
          {/* Left: Navigation */}
          <nav className="flex items-center space-x-1">
            {["Dashboard", "Pacientes", "Agenda"].map((item) => {
              const pathMap: Record<string, string> = {
                Dashboard: "/dashboard",
                Pacientes: "/patients",
                Agenda: "/schedule",
              };
              const isActive = location.pathname === pathMap[item];
              return (
                <Link
                  key={item}
                  to={pathMap[item]}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold font-manrope transition-colors ${
                    isActive
                      ? "text-primary font-bold bg-primary/5"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + Actions + Profile */}
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients or records..."
                className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 w-64 focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
              />
            </div>

            <div className="flex gap-1">
              <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">Dr. Smith</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Senior Cardiologist</p>
              </div>
              <img
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/10 group-hover:ring-primary transition-all"
                src={IMAGES.Profile}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
