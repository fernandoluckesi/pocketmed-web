import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

// ============================================================================
// Button Component
// Design base: rounded-2xl, font-bold, padding generoso, transição suave
// ============================================================================

type ButtonVariant =
  | "primary" // bg-primary text-white (padrão)
  | "secondary" // bg-white text-primary (como "Explorar" na imagem)
  | "outline" // border-primary text-primary bg-transparent
  | "ghost" // sem bg, text-primary, hover bg-primary/5
  | "danger" // bg-red-600 text-white
  | "danger-outline" // border-red text-red
  | "success" // bg-green-600 text-white
  | "dark"; // bg-slate-900 text-white

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98]",
  secondary:
    "bg-white text-primary hover:bg-slate-50 shadow-lg shadow-black/5 active:scale-[0.98]",
  outline:
    "bg-transparent text-primary border-2 border-primary hover:bg-primary/5 active:scale-[0.98]",
  ghost: "bg-transparent text-primary hover:bg-primary/5 active:scale-[0.98]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-[0.98]",
  "danger-outline":
    "bg-transparent text-red-600 border-2 border-red-300 hover:bg-red-50 active:scale-[0.98]",
  success:
    "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 active:scale-[0.98]",
  dark: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs rounded-xl gap-1.5",
  md: "px-6 py-3 text-sm rounded-2xl gap-2",
  lg: "px-8 py-4 text-base rounded-2xl gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-bold transition-all duration-200
        cursor-pointer border-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `
        .trim()
        .replace(/\s+/g, " ")}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
