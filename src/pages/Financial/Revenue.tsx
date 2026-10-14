import { useState, useEffect, useCallback } from "react";
import { Plus, Search, X, Pencil, Check } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { ActionsMenu } from "../../components/ui/ActionsMenu";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../contexts/ToastContext";
import {
  financialApi,
  type Revenue as RevenueType,
  type Convenio,
} from "../../services/financial";
import { formatDateOnly } from "../../utils/date";
import { maskCurrencyBRL, parseCurrencyBRL } from "../../utils/currency";

const BASE_SPECIALTIES = [
  "Cardiologia",
  "Ortopedia",
  "Pediatria",
  "Clínica Geral",
  "Dermatologia",
];

export default function Revenue() {
  const toast = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [revenues, setRevenues] = useState<RevenueType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterConvenio, setFilterConvenio] = useState("Todos");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterMinValue, setFilterMinValue] = useState("");
  const [filterMaxValue, setFilterMaxValue] = useState("");
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [doctors, setDoctors] = useState<
    {
      id: string;
      name: string;
      specialty: string;
      membershipId: string | null;
      transferPercentage: number | null;
    }[]
  >([]);
  const [filterDoctor, setFilterDoctor] = useState("Todos");
  const [defaultTransferPercentage, setDefaultTransferPercentage] =
    useState(50);
  const [editingPercentage, setEditingPercentage] = useState(false);
  const [percentageDraft, setPercentageDraft] = useState("");
  const [savingPercentage, setSavingPercentage] = useState(false);

  // Form state
  const [procedure, setProcedure] = useState("");
  const [specialty, setSpecialty] = useState("Cardiologia");
  const [doctorId, setDoctorId] = useState("");
  const [grossValue, setGrossValue] = useState("");
  const [status, setStatus] = useState("PENDENTE");
  const [paymentMethod, setPaymentMethod] = useState("Particular");
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const loadRevenues = useCallback(async () => {
    try {
      const filters: Record<string, string> = {};
      if (filterStatus !== "Todos") filters.status = filterStatus;
      if (filterConvenio !== "Todos") filters.convenioId = filterConvenio;
      if (filterDoctor !== "Todos") filters.doctorId = filterDoctor;
      if (filterStartDate) filters.startDate = filterStartDate;
      if (filterEndDate) filters.endDate = filterEndDate;
      const minValue = parseCurrencyBRL(filterMinValue);
      const maxValue = parseCurrencyBRL(filterMaxValue);
      if (minValue !== null) filters.minValue = String(minValue);
      if (maxValue !== null) filters.maxValue = String(maxValue);
      const result = await financialApi.listRevenues(filters);
      setRevenues(result.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [
    filterStatus,
    filterConvenio,
    filterDoctor,
    filterStartDate,
    filterEndDate,
    filterMinValue,
    filterMaxValue,
  ]);

  useEffect(() => {
    loadRevenues();
  }, [loadRevenues]);

  useEffect(() => {
    financialApi
      .listConvenios()
      .then((data) => setConvenios(Array.isArray(data) ? data : []))
      .catch(() => setConvenios([]));
  }, []);

  const loadDoctors = useCallback(() => {
    financialApi
      .listClinicDoctors()
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    financialApi
      .getSettings()
      .then((data) => {
        if (data?.defaultDoctorTransferPercentage !== undefined) {
          setDefaultTransferPercentage(
            Number(data.defaultDoctorTransferPercentage) || 50,
          );
        }
      })
      .catch(() => {});
  }, []);

  const specialtyOptions = [
    ...new Set([...BASE_SPECIALTIES, ...doctors.map((d) => d.specialty).filter(Boolean)]),
  ];

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const effectiveTransferPercentage =
    selectedDoctor?.transferPercentage ?? defaultTransferPercentage;
  const estimatedTransfer =
    doctorId && grossValue
      ? (parseFloat(grossValue) * effectiveTransferPercentage) / 100
      : null;

  const handleStartEditPercentage = () => {
    setPercentageDraft(String(effectiveTransferPercentage));
    setEditingPercentage(true);
  };

  const handleSavePercentage = async () => {
    if (!selectedDoctor?.membershipId) return;
    const value = parseFloat(percentageDraft);
    if (isNaN(value) || value < 0 || value > 100) {
      toast.error("Informe um percentual entre 0 e 100.");
      return;
    }
    setSavingPercentage(true);
    try {
      await financialApi.updateDoctorTransferPercentage(
        selectedDoctor.membershipId,
        value,
      );
      toast.success("Percentual de repasse atualizado.");
      setEditingPercentage(false);
      loadDoctors();
    } catch {
      toast.error("Não foi possível atualizar o percentual. Tente novamente.");
    } finally {
      setSavingPercentage(false);
    }
  };

  const hasActiveFilters =
    filterStatus !== "Todos" ||
    filterConvenio !== "Todos" ||
    filterDoctor !== "Todos" ||
    !!filterStartDate ||
    !!filterEndDate ||
    !!filterMinValue ||
    !!filterMaxValue;

  const clearFilters = () => {
    setFilterStatus("Todos");
    setFilterConvenio("Todos");
    setFilterDoctor("Todos");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterMinValue("");
    setFilterMaxValue("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedure || !grossValue || !doctorId) return;
    try {
      await financialApi.createRevenue({
        procedure,
        specialty,
        doctorId,
        grossValue: parseFloat(grossValue),
        discountValue: 0,
        netValue: parseFloat(grossValue),
        paymentMethod,
        status,
        dueDate,
      });
      setProcedure("");
      setGrossValue("");
      setShowAddForm(false);
      loadRevenues();
    } catch {
      // ignore
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<RevenueType | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Optimistic: flips the status in local state immediately, before the
  // request resolves. On success nothing else happens — the UI already shows
  // the right state, so there's no need to refetch. On failure, revert back
  // and surface the error via toast (this is the only feedback shown; a
  // successful change is silent by design).
  const handleToggleStatus = async (revenue: RevenueType) => {
    const previousStatus = revenue.status;
    const isPaid = previousStatus === "PAGO" || previousStatus === "RECEBIDO";
    const nextStatus = isPaid ? "PENDENTE" : "PAGO";

    setRevenues((prev) =>
      prev.map((r) => (r.id === revenue.id ? { ...r, status: nextStatus } : r)),
    );

    try {
      await financialApi.updateRevenueStatus(revenue.id, nextStatus);
    } catch {
      setRevenues((prev) =>
        prev.map((r) =>
          r.id === revenue.id ? { ...r, status: previousStatus } : r,
        ),
      );
      toast.error("Não foi possível atualizar o status. Tente novamente.");
    }
  };

  // Optimistic delete: removes the row right away and only re-inserts it (at
  // its original position) if the request actually fails.
  const handleConfirmDelete = async () => {
    const target = deleteTarget;
    if (!target) return;
    const index = revenues.findIndex((r) => r.id === target.id);

    setDeleting(true);
    setRevenues((prev) => prev.filter((r) => r.id !== target.id));

    try {
      await financialApi.deleteRevenue(target.id);
      toast.success("Receita excluída com sucesso.");
    } catch {
      setRevenues((prev) => {
        const next = [...prev];
        next.splice(index, 0, target);
        return next;
      });
      toast.error("Apenas receitas pendentes podem ser excluídas.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = revenues.filter((t) => {
    const matchesSearch =
      (t.procedure || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.specialty || "").toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalFilteredValue = filtered.reduce(
    (acc, t) => acc + (Number(t.netValue) || 0),
    0,
  );

  const statusMap: Record<string, { label: string; classes: string }> = {
    PAGO: {
      label: "Pago",
      classes: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    RECEBIDO: {
      label: "Recebido",
      classes: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    PENDENTE: {
      label: "Pendente",
      classes: "bg-amber-100 text-amber-700 border border-amber-200",
    },
    VENCIDO: {
      label: "Vencido",
      classes: "bg-rose-100 text-rose-700 border border-rose-200",
    },
    GLOSADO: {
      label: "Glosado",
      classes: "bg-rose-100 text-rose-700 border border-rose-200",
    },
    CANCELADO: {
      label: "Cancelado",
      classes: "bg-slate-100 text-slate-500 border border-slate-200",
    },
    FATURADO: {
      label: "Faturado",
      classes: "bg-blue-50 text-blue-700 border border-blue-100",
    },
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              Receitas Médicas
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Controle de faturamento, guias de convênios e pagamentos
              particulares
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Faturar Guia / Consulta</span>
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm flex flex-col gap-4"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Inserir Nova Guia / Lançamento Financeiro
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Procedimento
                </label>
                <input
                  type="text"
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                  placeholder="Consulta, Ecocardiograma..."
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Médico
                </label>
                <select
                  value={doctorId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setDoctorId(id);
                    const chosen = doctors.find((d) => d.id === id);
                    if (chosen?.specialty) setSpecialty(chosen.specialty);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                  required
                >
                  <option value="">Selecione...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {doctorId && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {editingPercentage ? (
                      <>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={percentageDraft}
                          onChange={(e) => setPercentageDraft(e.target.value)}
                          className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px]"
                          autoFocus
                        />
                        <span className="text-[11px] text-slate-400">%</span>
                        <button
                          type="button"
                          onClick={handleSavePercentage}
                          disabled={savingPercentage}
                          className="text-emerald-600 hover:bg-emerald-50 rounded p-0.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPercentage(false)}
                          className="text-slate-400 hover:bg-slate-100 rounded p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartEditPercentage}
                        className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-primary cursor-pointer"
                      >
                        Repasse: {effectiveTransferPercentage}%
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Especialidade
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                >
                  {specialtyOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={grossValue}
                  onChange={(e) => setGrossValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden font-mono"
                  placeholder="0.00"
                  required
                />
                {estimatedTransfer !== null && (
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Repasse estimado:{" "}
                    <span className="font-bold text-blue-600">
                      R${" "}
                      {estimatedTransfer.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                >
                  <option value="Particular">Particular</option>
                  <option value="Convênio">Convênio</option>
                  <option value="Cartão Crédito">Cartão Crédito</option>
                  <option value="Cartão Débito">Cartão Débito</option>
                  <option value="PIX">PIX</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Vencimento
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                  <option value="FATURADO">Faturado</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-primary text-white hover:bg-primary-dark px-5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                Confirmar Lançamento
              </button>
            </div>
          </form>
        )}

        {/* Filter Options */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                placeholder="Buscar por procedimento ou especialidade"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              >
                <option value="Todos">Status: Todos</option>
                <option value="PAGO">Pago</option>
                <option value="PENDENTE">Pendente</option>
                <option value="GLOSADO">Glosado</option>
                <option value="VENCIDO">Vencido</option>
                <option value="FATURADO">Faturado</option>
              </select>
            </div>
            <div>
              <select
                value={filterConvenio}
                onChange={(e) => setFilterConvenio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              >
                <option value="Todos">Convênio: Todos</option>
                {convenios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              >
                <option value="Todos">Médico: Todos</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end px-2">
              <span className="text-[11px] font-bold text-slate-500">
                Total:{" "}
                <strong className="text-blue-600">
                  R${" "}
                  {totalFilteredValue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </strong>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Vencimento de
              </label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                até
              </label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Valor de
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={filterMinValue}
                onChange={(e) => setFilterMinValue(maskCurrencyBRL(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs w-28 focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                até
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={filterMaxValue}
                onChange={(e) => setFilterMaxValue(maskCurrencyBRL(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs w-28 focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" /> Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3 font-bold">Procedimento</th>
                  <th className="px-6 py-3 font-bold">Especialidade</th>
                  <th className="px-6 py-3 font-bold">Pagamento</th>
                  <th className="px-6 py-3 font-bold text-right">Valor</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                  <th className="px-6 py-3 font-bold">Vencimento</th>
                  <th className="px-6 py-3 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-slate-400"
                    >
                      Nenhuma receita registrada
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const info = statusMap[t.status] || {
                      label: t.status,
                      classes:
                        "bg-slate-100 text-slate-600 border border-slate-200",
                    };
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          {t.procedure}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200/20 text-on-surface-variant rounded-full text-[11px] font-bold">
                            {t.specialty}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-medium text-slate-600">
                          {t.paymentMethod}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-slate-900 font-mono">
                          R${" "}
                          {Number(t.netValue).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${info.classes}`}
                          >
                            {info.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 font-medium">
                          {formatDateOnly(t.dueDate)}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <ActionsMenu
                            items={[
                              {
                                label:
                                  t.status === "PAGO" ||
                                  t.status === "RECEBIDO"
                                    ? "Marcar como Pendente"
                                    : "Marcar como Pago",
                                onClick: () => handleToggleStatus(t),
                              },
                              {
                                label: "Excluir",
                                onClick: () => setDeleteTarget(t),
                                variant: "danger",
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Receita"
        description={`Tem certeza que deseja excluir "${deleteTarget?.procedure}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
      />
    </MainLayout>
  );
}
