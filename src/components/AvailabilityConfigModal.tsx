import { useEffect, useState } from "react";
import {
  X,
  Clock,
  Plus,
  Trash2,
  CalendarCog,
  Loader2,
  CalendarX,
  CalendarPlus,
  Ban,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/Button";
import { api, ApiError } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import {
  WEEK_DAYS,
  emptyWeekly,
  generateSlots,
  toMinutes,
  weekdayKeyFromDate,
  type Interval,
  type Weekly,
  type AvailabilityRule,
  type AvailabilityException,
} from "../utils/availability";

interface AvailabilityConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const DURATION_OPTIONS = [10, 15, 20, 30, 40, 45, 60];
const BUFFER_OPTIONS = [0, 5, 10, 15, 20, 30];

/** Formats a "YYYY-MM-DD" string as a friendly local date, e.g. "25/03/2026". */
function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
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

  // --- Specific-date exceptions ---
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [excDate, setExcDate] = useState("");
  const [excMode, setExcMode] = useState<"close" | "custom">("close");
  const [excIntervals, setExcIntervals] = useState<Interval[]>([
    { start: "09:00", end: "12:00" },
  ]);
  const [excReason, setExcReason] = useState("");
  const [savingException, setSavingException] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rules, excs] = await Promise.all([
          api("/availabilityRules") as Promise<AvailabilityRule[]>,
          (
            api("/availabilityExceptions") as Promise<AvailabilityException[]>
          ).catch(() => [] as AvailabilityException[]),
        ]);
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
        setExceptions(Array.isArray(excs) ? excs : []);
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

  // --- Specific-date exception handlers ---

  function updateExcInterval(
    index: number,
    field: "start" | "end",
    value: string,
  ) {
    setExcIntervals((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    );
  }

  function addExcInterval() {
    setExcIntervals((prev) => [...prev, { start: "13:00", end: "17:00" }]);
  }

  function removeExcInterval(index: number) {
    setExcIntervals((prev) => prev.filter((_, i) => i !== index));
  }

  function resetExceptionForm() {
    setExcDate("");
    setExcMode("close");
    setExcIntervals([{ start: "09:00", end: "12:00" }]);
    setExcReason("");
  }

  async function handleAddException() {
    setError(null);

    if (!excDate) {
      setError("Selecione a data que deseja personalizar.");
      return;
    }

    if (exceptions.some((e) => e.type === "single" && e.date === excDate)) {
      setError("Já existe uma personalização para esta data.");
      return;
    }

    // Custom availability: the intervals replace the weekly rule for that date.
    let body: Record<string, unknown>;
    if (excMode === "custom") {
      if (excIntervals.length === 0) {
        setError("Adicione ao menos um período de atendimento.");
        return;
      }
      for (const it of excIntervals) {
        if (toMinutes(it.end) <= toMinutes(it.start)) {
          setError("O horário final deve ser maior que o inicial.");
          return;
        }
      }
      // The backend stores a single startTime/endTime window per exception,
      // so we persist one exception per interval for the same date.
      // The first one carries the reason.
      body = {
        type: "single",
        date: excDate,
        fullDay: false,
        startTime: excIntervals[0].start,
        endTime: excIntervals[0].end,
        reason: excReason.trim() || null,
      };
    } else {
      body = {
        type: "single",
        date: excDate,
        fullDay: true,
        reason: excReason.trim() || "Agenda fechada",
      };
    }

    setSavingException(true);
    try {
      const created: AvailabilityException = await api(
        "/availabilityExceptions",
        { method: "POST", body },
      );
      let extra: AvailabilityException[] = [];
      // Persist the remaining custom intervals as additional exceptions.
      if (excMode === "custom" && excIntervals.length > 1) {
        extra = await Promise.all(
          excIntervals.slice(1).map((it) =>
            api("/availabilityExceptions", {
              method: "POST",
              body: {
                type: "single",
                date: excDate,
                fullDay: false,
                startTime: it.start,
                endTime: it.end,
              },
            }),
          ),
        );
      }
      setExceptions((prev) => [created, ...extra, ...prev]);
      resetExceptionForm();
      toast.success("Data personalizada com sucesso!");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.data?.message || "Erro ao personalizar a data."
          : "Erro ao personalizar a data.";
      setError(String(msg));
    } finally {
      setSavingException(false);
    }
  }

  async function handleRemoveException(ids: string[]) {
    try {
      await Promise.all(
        ids.map((id) =>
          api(`/availabilityExceptions/${id}`, { method: "DELETE" }),
        ),
      );
      setExceptions((prev) => prev.filter((e) => !ids.includes(e.id)));
    } catch {
      toast.error("Erro ao remover a personalização.");
    }
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

  // Group exceptions by date so multiple custom intervals for the same day
  // render as a single card. A closed day (fullDay) takes precedence.
  interface GroupedException {
    date: string;
    closed: boolean;
    reason: string | null;
    intervals: Interval[];
    ids: string[];
  }

  const groupedExceptions: GroupedException[] = (() => {
    const byDate = new Map<string, GroupedException>();
    for (const exc of exceptions) {
      const key = exc.date || exc.startDate || exc.id;
      let group = byDate.get(key);
      if (!group) {
        group = {
          date: key,
          closed: false,
          reason: null,
          intervals: [],
          ids: [],
        };
        byDate.set(key, group);
      }
      group.ids.push(exc.id);
      if (exc.reason && !group.reason) group.reason = exc.reason;
      if (exc.fullDay) {
        group.closed = true;
      } else if (exc.startTime && exc.endTime) {
        group.intervals.push({ start: exc.startTime, end: exc.endTime });
      }
    }
    return Array.from(byDate.values())
      .map((g) => ({
        ...g,
        intervals: g.intervals.sort(
          (a, b) => toMinutes(a.start) - toMinutes(b.start),
        ),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  })();

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

                {/* Personalizar dia específico */}
                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarCog className="w-3.5 h-3.5 text-primary" />
                      Personalizar dia específico
                    </label>
                    <p className="text-xs text-slate-400">
                      Feche a agenda ou defina horários diferentes para uma data
                      exata. Sobrescreve a configuração semanal.
                    </p>
                  </div>

                  {/* New exception form */}
                  <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Data
                        </label>
                        <input
                          type="date"
                          value={excDate}
                          onChange={(e) => setExcDate(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer outline-none"
                        />
                        {excDate && (
                          <p className="text-[11px] text-slate-400">
                            Padrão semanal:{" "}
                            {(() => {
                              const key = weekdayKeyFromDate(excDate);
                              const label = WEEK_DAYS.find(
                                (d) => d.key === key,
                              )?.label;
                              return label ?? "—";
                            })()}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Motivo (opcional)
                        </label>
                        <input
                          type="text"
                          value={excReason}
                          onChange={(e) => setExcReason(e.target.value)}
                          placeholder="Ex.: Feriado, congresso..."
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 outline-none"
                        />
                      </div>
                    </div>

                    {/* Mode selector */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setExcMode("close")}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                          excMode === "close"
                            ? "bg-red-50 border-red-200 text-red-600"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <CalendarX className="w-4 h-4" />
                        Fechar agenda
                      </button>
                      <button
                        type="button"
                        onClick={() => setExcMode("custom")}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                          excMode === "custom"
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <CalendarPlus className="w-4 h-4" />
                        Horários personalizados
                      </button>
                    </div>

                    {/* Custom intervals */}
                    {excMode === "custom" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Períodos de atendimento
                          </span>
                          <button
                            type="button"
                            onClick={addExcInterval}
                            className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 cursor-pointer border-none bg-transparent"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Adicionar período
                          </button>
                        </div>
                        {excIntervals.map((it, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={it.start}
                              onChange={(e) =>
                                updateExcInterval(i, "start", e.target.value)
                              }
                              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm cursor-pointer outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                            />
                            <span className="text-slate-400 text-sm">até</span>
                            <input
                              type="time"
                              value={it.end}
                              onChange={(e) =>
                                updateExcInterval(i, "end", e.target.value)
                              }
                              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm cursor-pointer outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                            />
                            {excIntervals.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExcInterval(i)}
                                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddException}
                      loading={savingException}
                    >
                      Adicionar personalização
                    </Button>
                  </div>

                  {/* Lista de dias personalizados */}
                  {groupedExceptions.length > 0 && (
                    <div className="space-y-3">
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Dias personalizados
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {groupedExceptions.map((g) => (
                          <div
                            key={g.date}
                            className={`rounded-xl border p-4 space-y-3 ${
                              g.closed
                                ? "bg-red-50/60 border-red-100"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`p-2 rounded-lg shrink-0 ${
                                    g.closed
                                      ? "bg-red-100 text-red-600"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {g.closed ? (
                                    <Ban className="w-4 h-4" />
                                  ) : (
                                    <Clock className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-900">
                                    {formatDateBR(g.date)}
                                  </p>
                                  <p
                                    className={`text-[11px] font-semibold ${
                                      g.closed ? "text-red-500" : "text-primary"
                                    }`}
                                  >
                                    {g.closed
                                      ? "Agenda fechada"
                                      : "Horários personalizados"}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveException(g.ids)}
                                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {!g.closed && g.intervals.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {g.intervals.map((it, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                                  >
                                    {it.start}
                                    <span className="text-slate-400">às</span>
                                    {it.end}
                                  </span>
                                ))}
                              </div>
                            )}

                            {g.reason && (
                              <p className="text-xs text-slate-500">
                                <span className="font-semibold text-slate-400">
                                  Motivo:{" "}
                                </span>
                                {g.reason}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
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
