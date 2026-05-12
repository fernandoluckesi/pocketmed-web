import { ICONS } from "../constants";
import { motion } from "motion/react";

const navItems = [
  { icon: ICONS.Dashboard, label: "Dashboard", active: true },
  { icon: ICONS.Patients, label: "Patients" },
  { icon: ICONS.Doctors, label: "Doctors" },
  { icon: ICONS.Schedule, label: "Schedule" },
  { icon: ICONS.Management, label: "Clinical Management" },
];

const personalItems = [
  { icon: ICONS.Account, label: "My Account" },
  { icon: ICONS.Plans, label: "Plans" },
];

export const Sidebar = () => {
  return (
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
        {navItems.map((item, idx) => (
          <motion.a
            key={idx}
            href="#"
            whileHover={{ x: 4 }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-full transition-all duration-200 font-manrope text-sm font-semibold ${
              item.active
                ? "bg-white text-primary shadow-sm"
                : "text-slate-600 hover:text-primary hover:bg-slate-200"
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </motion.a>
        ))}

        <div className="pt-6 pb-2 px-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
            Personal
          </p>
        </div>

        {personalItems.map((item, idx) => (
          <motion.a
            key={idx}
            href="#"
            whileHover={{ x: 4 }}
            className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:text-primary hover:bg-slate-200 transition-all rounded-full font-manrope text-sm font-semibold"
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </motion.a>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-200/50 pt-4">
        <a
          className="flex items-center space-x-3 px-4 py-3 text-error hover:bg-error-container/20 transition-all rounded-full font-manrope text-sm font-semibold"
          href="#"
        >
          <ICONS.Logout size={18} />
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};
