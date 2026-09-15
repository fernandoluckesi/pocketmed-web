import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/Button";
import { backofficeLogin } from "../../services/backoffice";
import { ApiError } from "../../services/api";
import logoHorizontal from "../../assets/logos/hispora-horizontal-primary.png";

export default function BackofficeLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await backofficeLogin(email, password);
      navigate("/backoffice/doctor-verification");
    } catch (err) {
      // The API returns a generic message on purpose (no account enumeration).
      const msg =
        err instanceof ApiError
          ? err.data?.message || "Credenciais inválidas."
          : "Não foi possível entrar. Tente novamente.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8"
      >
        <div className="space-y-6">
          <img src={logoHorizontal} alt="Hispora" className="h-12 w-auto" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
                Backoffice
              </h1>
              <p className="text-sm text-slate-500">
                Acesso restrito à equipe Hispora.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="bo-email"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="bo-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@hispora.com"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bo-password"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="bo-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-500 font-medium">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
          >
            Entrar
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
