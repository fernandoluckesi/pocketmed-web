import { useLocation, Link } from "react-router-dom";
import { ICONS } from "../constants";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import iconLogo from "../assets/images/icon.png";

const navItems = [
  {
    icon: ICONS.Dashboard,
    label: "Painel",
    path: "/dashboard",
    adminOnly: false,
  },
  {
    icon: ICONS.Patients,
    label: "Pacientes",
    path: "/patients",
    adminOnly: false,
  },
  { icon: ICONS.Doctors, label: "Médicos", path: "/doctors", adminOnly: false },
  {
    icon: ICONS.Schedule,
    label: "Agenda",
    path: "/schedule",
    adminOnly: false,
  },
  {
    icon: ICONS.Management,
    label: "Gestão Clínica",
    path: "/clinical-management",
    adminOnly: true,
  },
];

const personalItems = [
  { icon: ICONS.Account, label: "Minha Conta", path: "/account" },
  { icon: ICONS.Plans, label: "Planos", path: "/plans" },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 flex flex-col p-6 space-y-8 z-50">
      <div className="flex items-center space-x-3 px-2">
        <img src={iconLogo} alt="PocketMed" className="w-10 h-10 rounded-xl" />
        <div>
          <h2 className="text-xl font-black text-primary tracking-tight font-manrope">
            PocketMed
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
            Excelência Clínica
          </p>
        </div>
      </div>

      <nav className="flex-grow space-y-1">
        {filteredNavItems.map((item, idx) => {
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
            Pessoal
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
          className="flex items-center space-x-3 px-4 py-3 text-error hover:bg-error-container/20 transition-all rounded-full font-manrope text-sm font-semibold"
          href="#"
        >
          <ICONS.Logout size={18} />
          <span>Sair</span>
        </a>
      </div>
    </aside>
  );
};
