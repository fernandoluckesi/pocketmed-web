import { useEffect, useState } from "react";
import { X, Clock, Plus, Trash2, CalendarCog, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/Button";
import { api, ApiError } from "../services/api";
import { useToast } from "../contexts/ToastContext";

interface AvailabilityConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

interface Interval {
  start: string;
  end: string;
}

interface DayConfig {
  enabled: boolean;
  intervals: Interval[];
}

type Weekly = Record<string, DayConfig>;

interface AvailabilityRule {
  id: string;
  name: string | null;
  weekly: Weekly;
  duration: number;
  buffer: number;
}

// Ordered list of week days (keys match the backend "weekly" object).
const WEEK_DAYS: { key: string; label: string; short: string }[] = [
  { key: "monday", label: "Segunda-feira", short: "Seg" },
  { key: "tuesday", label: "Terça-feira", short: "Ter" },
  { key: "wednesday", label: "Quarta-feira", short: "Qua" },
  { key: "thursday", label: "Quinta-feira", short: "Qui" },
  { key: "friday", label: "Sexta-feira", short: "Sex" },
  { key: "saturday", label: "Sábado", short: "Sáb" },
  { key: "sunday", label: "Domingo", short: "Dom" },
];

const DURATION_OPTIONS = [10, 15, 20, 30, 40, 45, 60];
const BUFFER_OPTIONS = [0, 5, 10, 15, 20, 30];

function emptyWeekly(): Weekly {
  const w: Weekly = {};
  for (const d of WEEK_DAYS) {
    w[d.key] = { enabled: false, intervals: [] };
  }
  return w;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Generates the bookable time-slot grid for a single day given its intervals,
 * the consultation duration and the buffer between consultations.
 */
function generateSlots(
  intervals: Interval[],
  duration: number,
  buffer: number,
): string[] {
  if (duration < 1) return [];
  const slots: string[] = [];
  const step = duration + Math.max(buffer, 0);
  for (const interval of intervals) {
    const start = toMinutes(interval.start);
    const end = toMinutes(interval.end);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) continue;
    for (let t = start; t + duration <= end; t += step) {
      slots.push(toHHMM(t));
    }
  }
  return slots;
}

export function AvailabilityConfigModal({
  isOpen,
  onClose,
  onSaved,
}: AvailabilityConfigModalProps) {
  const toast = useToast();

  const [ruleId, setRuleId] = useState<string | null>(null);
  const [weekly, setWeekly] = useState<Weekly>(emptyWeekly());
  const [duration, setDuration] = useState(30);
  const [buffer, setBuffer] = useState(0);
  const [previewDay, setPreviewDay] = useState<string>("monday");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const rules: AvailabilityRule[] = await api("/availabilityRules");
        const rule = Array.isArray(rules) && rules.length > 0 ? rules[0] : null;
        if (cancelled) return;
        if (rule) {
          setRuleId(rule.id);
          // Normalize weekly so every day key exists.
          const normalized = emptyWeekly();
          for (const d of WEEK_DAYS) {
            const dc = rule.weekly?.[d.key];
            if (dc) {
              normalized[d.key] = {
                enabled: !!dc.enabled,
                intervals: Array.isArray(dc.intervals) ? dc.intervals : [],
              };
            }
          }
          setWeekly(normalized);
          setDuration(rule.duration ?? 30);
          setBuffer(rule.buffer ?? 0);
        }
      } catch {
        if (!cancelled) setError("Erro ao carregar a configuração da agenda.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  function toggleDay(dayKey: string) {
    setWeekly((prev) => {
      const day = prev[dayKey];
      const enabled = !day.enabled;
      return {
        ...prev,
        [dayKey]: {
          enabled,
          // When enabling a day with no intervals, seed a sensible default.
          intervals:
            enabled && day.intervals.length === 0
              ? [{ start: "09:00", end: "17:00" }]
              : day.intervals,
        },
      };
    });
  }

  function updateInterval(
    dayKey: string,
    index: number,
    field: "start" | "end",
    value: string,
  ) {
    setWeekly((prev) => {
      const intervals = prev[dayKey].intervals.map((it, i) =>
        i === index ? { ...it, [field]: value } : it,
      );
      return { ...prev, [dayKey]: { ...prev[dayKey], intervals } };
    });
  }

  function addInterval(dayKey: string) {
    setWeekly((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        intervals: [
          ...prev[dayKey].intervals,
          { start: "09:00", end: "12:00" },
        ],
      },
    }));
  }

  function removeInterval(dayKey: string, index: number) {
    setWeekly((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        intervals: prev[dayKey].intervals.filter((_, i) => i !== index),
      },
    }));
  }

  function validate(): string | null {
    if (duration < 1)
      return "A duração da consulta deve ser de ao menos 1 minuto.";
    for (const d of WEEK_DAYS) {
      const day = weekly[d.key];
      if (!day.enabled) continue;
      for (const it of day.intervals) {
        if (toMinutes(it.end) <= toMinutes(it.start)) {
          return `Em ${d.label}, o horário final deve ser maior que o inicial.`;
        }
      }
    }
    return null;
  }

  async function handleSave() {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!ruleId) {
      setError("Configuração não carregada. Tente reabrir o modal.");
      return;
    }

    setSaving(true);
    try {
      await api(`/availabilityRules/${ruleId}`, {
        method: "PUT",
        body: { weekly, duration, buffer },
      });
      toast.success("Agenda configurada com sucesso!");
      onSaved?.();
      onClose();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.data?.message || "Erro ao salvar a configuração."
          : "Erro ao salvar a configuração.";
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  }

  const previewSlots = generateSlots(
    weekly[previewDay]?.enabled ? weekly[previewDay].intervals : [],
    duration,
    buffer,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-5 border-b border-slate-100 shrink-0 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CalendarCog className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
                    Configurar Agenda
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Defina seus horários de atendimento e o intervalo entre
                    consultas.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            {loading ? (
              <div className="flex items-center justify-center py-24 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Carregando...
              </div>
            ) : (
              <div className="px-8 py-6 space-y-6 overflow-y-auto flex-1">
                {/* Duração + Intervalo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Duração da consulta
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer outline-none"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    >
                      {DURATION_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d} minutos
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Intervalo entre consultas
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer outline-none"
                      value={buffer}
                      onChange={(e) => setBuffer(Number(e.target.value))}
                    >
                      {BUFFER_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b === 0 ? "Sem intervalo" : `${b} minutos`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dias da semana */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Horários de atendimento
                  </label>
                  {WEEK_DAYS.map((d) => {
                    const day = weekly[d.key];
                    return (
                      <div
                        key={d.key}
                        className="border border-slate-200 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleDay(d.key)}
                              className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer border-none ${
                                day.enabled ? "bg-primary" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                  day.enabled ? "translate-x-4" : ""
                                }`}
                              />
                            </button>
                            <span className="font-semibold text-slate-800 text-sm">
                              {d.label}
                            </span>
                          </div>
                          {day.enabled && (
                            <button
                              type="button"
                              onClick={() => addInterval(d.key)}
                              className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 cursor-pointer border-none bg-transparent"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Adicionar período
                            </button>
                          )}
                        </div>

                        {day.enabled && (
                          <div className="mt-3 space-y-2">
                            {day.intervals.length === 0 && (
                              <p className="text-xs text-slate-400">
                                Nenhum período. Adicione um horário de
                                atendimento.
                              </p>
                            )}
                            {day.intervals.map((it, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={it.start}
                                  onChange={(e) =>
                                    updateInterval(
                                      d.key,
                                      i,
                                      "start",
                                      e.target.value,
                                    )
                                  }
                                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-pointer outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                                />
                                <span className="text-slate-400 text-sm">
                                  até
                                </span>
                                <input
                                  type="time"
                                  value={it.end}
                                  onChange={(e) =>
                                    updateInterval(
                                      d.key,
                                      i,
                                      "end",
                                      e.target.value,
                                    )
                                  }
                                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-pointer outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeInterval(d.key, i)}
                                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Prévia da grade */}
                <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Clock className="w-4 h-4 text-primary" />
                      Prévia da grade de horários
                    </div>
                    <select
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer outline-none"
                      value={previewDay}
                      onChange={(e) => setPreviewDay(e.target.value)}
                    >
                      {WEEK_DAYS.map((d) => (
                        <option key={d.key} value={d.key}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {previewSlots.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      Nenhum horário disponível para este dia.
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {previewSlots.map((slot) => (
                        <span
                          key={slot}
                          className="py-1.5 rounded-lg text-xs font-bold text-center bg-white border border-slate-200 text-slate-700"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="px-8 py-5 flex justify-end items-center gap-3 border-t border-slate-100 shrink-0">
              <Button variant="ghost" size="md" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                loading={saving}
                disabled={loading}
              >
                Salvar Configuração
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
