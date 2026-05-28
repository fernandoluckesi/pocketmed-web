import { type ReactNode, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ICONS } from "../constants";
import {
  Search,
  Bell,
  ShieldAlert,
  DollarSign,
  ArrowLeft,
  LayoutDashboard,
  Receipt,
  FileText,
  Wallet,
  Handshake,
  Landmark,
  BarChart3,
  FileBarChart,
} from "lucide-react";
import { logout } from "../services/auth";
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
  {
    icon: ICONS.Consultations,
    label: "Consultas",
    path: "/consultations",
    adminOnly: false,
  },
  { icon: ICONS.Doctors, label: "Médicos", path: "/doctors", adminOnly: true },
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

const financialItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/financial" },
  { icon: Receipt, label: "Receitas", path: "/financial/revenue" },
  { icon: FileText, label: "Despesas", path: "/financial/expenses" },
  { icon: Wallet, label: "Fluxo de Caixa", path: "/financial/cashflow" },
  { icon: Handshake, label: "Convênios", path: "/financial/insurance" },
  { icon: Landmark, label: "Repasse Médico", path: "/financial/transfers" },
  { icon: BarChart3, label: "Centro de Custos", path: "/financial/costs" },
  { icon: FileBarChart, label: "DRE", path: "/financial/dre" },
  { icon: FileText, label: "Relatórios", path: "/financial/reports" },
];

const personalItems = [
  { icon: ICONS.Account, label: "Minha Conta", path: "/account" },
  { icon: ICONS.Plans, label: "Planos", path: "/plans" },
];

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showFinancialMenu, setShowFinancialMenu] = useState(
    location.pathname.startsWith("/financial"),
  );

  const isAdmin = user?.role === "admin";
  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <div className="min-h-screen flex bg-surface text-on-surface">
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 flex flex-col p-6 space-y-8 z-50">
        <div className="flex items-center space-x-3 px-2">
          <img
            src={iconLogo}
            alt="PocketMed"
            className="w-10 h-10 rounded-xl"
          />
          <h2 className="text-xl font-black text-primary tracking-tight font-manrope">
            PocketMed
          </h2>
        </div>

        <nav className="flex-grow space-y-1">
          {showFinancialMenu ? (
            <>
              {/* Financial Submenu */}
              <button
                onClick={() => setShowFinancialMenu(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-full text-slate-600 hover:text-primary hover:bg-slate-200 transition-all font-manrope text-sm font-semibold cursor-pointer w-full border-none bg-transparent mb-2"
              >
                <ArrowLeft size={18} />
                <span>Voltar</span>
              </button>

              <div className="px-4 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
                  Financeiro
                </p>
              </div>

              {financialItems.map((item, idx) => {
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
            </>
          ) : (
            <>
              {/* Main Menu */}
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

              {/* Financeiro - admin only */}
              {isAdmin && (
                <motion.div whileHover={{ x: 4 }}>
                  <button
                    onClick={() => setShowFinancialMenu(true)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-full transition-all duration-200 font-manrope text-sm font-semibold w-full border-none cursor-pointer ${
                      location.pathname.startsWith("/financial")
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-600 hover:text-primary hover:bg-slate-200 bg-transparent"
                    }`}
                  >
                    <DollarSign size={18} />
                    <span>Financeiro</span>
                  </button>
                </motion.div>
              )}

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
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-slate-200/50 pt-4">
          <button
            onClick={() => logout()}
            className="flex items-center space-x-3 px-4 py-3 text-error hover:bg-error-container/20 transition-all rounded-full font-manrope text-sm font-semibold cursor-pointer w-full border-none bg-transparent"
          >
            <ICONS.Logout size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-grow flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-8 py-4">
          {/* Left: Navigation */}
          <nav className="flex items-center space-x-1">
            {["Painel", "Pacientes", "Agenda"].map((item) => {
              const pathMap: Record<string, string> = {
                Painel: "/dashboard",
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
                placeholder="Pesquisar pacientes ou registros..."
                className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 w-64 focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
              />
            </div>

            <div className="flex gap-1">
              <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <div
              onClick={() => navigate("/account")}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">
                  {user?.name || user?.email || "Usuário"}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {user?.role === "admin" ? "Administrador" : "Médico"}
                </p>
              </div>
              {user?.profileImage ? (
                <img
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/10 group-hover:ring-primary transition-all"
                  src={user.profileImage}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 ring-2 ring-primary/10 group-hover:ring-primary transition-all flex items-center justify-center text-primary font-bold text-xs">
                  {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex-1">
          {/* Verification Alert Banner */}
          {location.pathname !== "/verification" && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-2.5 bg-amber-100 rounded-xl shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900">
                  Verificação pendente
                </p>
                <p className="text-xs text-amber-700">
                  Envie seus documentos profissionais para ativar todas as
                  funcionalidades da plataforma.
                </p>
              </div>
              <button
                onClick={() => navigate("/verification")}
                className="shrink-0 bg-amber-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer border-none"
              >
                Completar Verificação
              </button>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
