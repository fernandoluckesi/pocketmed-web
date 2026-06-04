import type { ReactNode } from "react";

// --- Base Label ---
function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
    >
      {children}
    </label>
  );
}

// --- Error Message ---
function ErrorMessage({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

// --- Input Wrapper (icon support) ---
function inputClasses(error?: boolean) {
  return `w-full bg-slate-50 border rounded-xl py-3.5 px-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${
    error ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-primary"
  }`;
}

// --- Text Input ---
interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string | null;
  type?: "text" | "email" | "tel" | "password";
  inputMode?: "text" | "numeric" | "email" | "tel";
  maxLength?: number;
  disabled?: boolean;
  icon?: ReactNode;
}

export function TextInput({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  type = "text",
  inputMode,
  maxLength,
  disabled,
  icon,
}: TextInputProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={`${inputClasses(!!error)} ${icon ? "pl-12" : ""}`}
        />
      </div>
      <ErrorMessage message={error} />
    </div>
  );
}

// --- Number Input ---
interface NumberInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string | null;
  step?: string;
  min?: string;
  max?: string;
  suffix?: string;
}

export function NumberInput({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  step,
  min,
  max,
  suffix,
}: NumberInputProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="number"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`${inputClasses(!!error)} ${suffix ? "pr-16" : ""}`}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-extrabold tracking-wider pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      <ErrorMessage message={error} />
    </div>
  );
}

// --- Date Input ---
interface DateInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
}

export function DateInput({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
}: DateInputProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={inputClasses(!!error)}
      />
      <ErrorMessage message={error} />
    </div>
  );
}

// --- Textarea ---
interface TextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string | null;
  rows?: number;
}

export function Textarea({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  rows = 3,
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClasses(!!error)} resize-none`}
      />
      <ErrorMessage message={error} />
    </div>
  );
}

// --- Select (native styled, for simple cases) ---
interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string | null;
}

export function SelectInput({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  error,
}: SelectInputProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`${inputClasses(!!error)} appearance-none cursor-pointer`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ErrorMessage message={error} />
    </div>
  );
}

// --- File Input ---
interface FileInputProps {
  label: string;
  name: string;
  onChange: (file: File | null) => void;
  accept?: string;
  error?: string | null;
}

export function FileInput({
  label,
  name,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  error,
}: FileInputProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="w-full px-4 py-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-sm cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:border-primary/50 transition-colors"
      />
      <ErrorMessage message={error} />
    </div>
  );
}

// --- Form Actions (footer buttons) ---
interface FormActionsProps {
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
}

export function FormActions({
  onCancel,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  loading,
  loadingLabel = "Salvando...",
  icon,
}: FormActionsProps) {
  return (
    <div className="pt-4 flex gap-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="flex-1 bg-slate-100 py-4 rounded-full font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-none disabled:opacity-50"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-primary py-4 rounded-full font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-70"
      >
        {loading ? loadingLabel : (
          <>
            {icon}
            {submitLabel}
          </>
        )}
      </button>
    </div>
  );
}
