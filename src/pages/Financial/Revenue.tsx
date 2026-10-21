import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  TrendingUp,
  PlusCircle,
  Clock,
  AlertCircle,
  Search,
  X,
  Pencil,
  Check,
} from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { ActionsMenu } from "../../components/ui/ActionsMenu";
import { ConfirmModal } from "../../components/ConfirmModal";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { useToast } from "../../contexts/ToastContext";
import {
  financialApi,
  type Revenue as RevenueType,
  type Convenio,
  type ConvenioProcedure,
  type ConvenioPlan,
  type TussProcedureOption,
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
  const [formConvenioId, setFormConvenioId] = useState("");
  const [procedureCode, setProcedureCode] = useState("");
  const [authorizationNumber, setAuthorizationNumber] = useState("");
  const [insurancePlanName, setInsurancePlanName] = useState("");
  const [insuranceCardNumber, setInsuranceCardNumber] = useState("");
  const [convenioProcedures, setConvenioProcedures] = useState<
    ConvenioProcedure[]
  >([]);
  const [convenioPlans, setConvenioPlans] = useState<ConvenioPlan[]>([]);
  const [tussOptions, setTussOptions] = useState<TussProcedureOption[]>([]);
  const [showTussOptions, setShowTussOptions] = useState(false);
  const [procedureOptions, setProcedureOptions] = useState<TussProcedureOption[]>([]);
  const [showProcedureOptions, setShowProcedureOptions] = useState(false);
  const [commonProcedureOptions, setCommonProcedureOptions] = useState<
    TussProcedureOption[]
  >([]);

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

  // Loads this convênio's own remuneration table so the procedure code can
  // auto-fill the value it actually pays (see handleProcedureCodeBlur below).
  useEffect(() => {
    if (!formConvenioId) {
      setConvenioProcedures([]);
      return;
    }
    financialApi
      .listConvenioProcedures(formConvenioId)
      .then((data) => setConvenioProcedures(Array.isArray(data) ? data : []))
      .catch(() => setConvenioProcedures([]));
  }, [formConvenioId]);

  // Loads this convênio's registered plans so Plano can be a select instead
  // of free text.
  useEffect(() => {
    if (!formConvenioId) {
      setConvenioPlans([]);
      setInsurancePlanName("");
      return;
    }
    financialApi
      .listConvenioPlans(formConvenioId)
      .then((data) => setConvenioPlans(Array.isArray(data) ? data : []))
      .catch(() => setConvenioPlans([]));
  }, [formConvenioId]);

  // Set right before a dropdown selection programmatically changes
  // procedureCode/procedure, so the debounce effects below don't treat that
  // change as the user typing and immediately re-search (which would find
  // the just-selected option again by its own name/code and pop the
  // dropdown back open right after it was closed).
  const skipTussCodeSearchRef = useRef(false);
  const skipProcedureSearchRef = useRef(false);

  // Debounced lookup against the official ANS TUSS table, so the user can
  // search by code or by name instead of having to know the 8-digit code.
  useEffect(() => {
    if (skipTussCodeSearchRef.current) {
      skipTussCodeSearchRef.current = false;
      return;
    }
    if (procedureCode.trim().length < 3) {
      setTussOptions([]);
      return;
    }
    const timeout = setTimeout(() => {
      financialApi
        .searchTussProcedures(procedureCode.trim())
        .then((data) => {
          const options = Array.isArray(data) ? data : [];
          setTussOptions(options);
          setShowTussOptions(options.length > 0);
        })
        .catch(() => setTussOptions([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [procedureCode]);

  // Same TUSS lookup, but for the always-visible "Procedimento" field at the
  // top of the form (unlike Código do Procedimento above, which only shows up
  // once "Convênio" is picked as the payment method).
  useEffect(() => {
    if (skipProcedureSearchRef.current) {
      skipProcedureSearchRef.current = false;
      return;
    }
    if (procedure.trim().length < 3) {
      setProcedureOptions([]);
      return;
    }
    const timeout = setTimeout(() => {
      financialApi
        .searchTussProcedures(procedure.trim())
        .then((data) => {
          const options = Array.isArray(data) ? data : [];
          setProcedureOptions(options);
          setShowProcedureOptions(options.length > 0);
        })
        .catch(() => setProcedureOptions([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [procedure]);

  // Loaded once: shown as a head start when Procedimento is focused empty.
  useEffect(() => {
    financialApi
      .getCommonTussProcedures()
      .then((data) => setCommonProcedureOptions(Array.isArray(data) ? data : []))
      .catch(() => setCommonProcedureOptions([]));
  }, []);

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

  // Below 3 characters there's no live search yet (see the debounce effects
  // above), so the dropdown falls back to this clinic's most-billed codes.
  const isShowingCommonProcedures = procedure.trim().length < 3;
  const displayedProcedureOptions = isShowingCommonProcedures
    ? commonProcedureOptions
    : procedureOptions;

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

  // Auto-fills Valor from the convênio's own remuneration table when the
  // typed code matches one already registered — editable afterward, same as
  // the repasse % above. Never overwrites a value the convênio table doesn't
  // know about, so an unregistered code just leaves the field as-is.
  const applyConvenioProcedureValue = (code: string) => {
    if (!formConvenioId || !code) return;
    const match = convenioProcedures.find(
      (p) => p.procedureCode === code.trim(),
    );
    if (match) {
      setGrossValue(String(match.value));
    }
  };

  const handleProcedureCodeBlur = () => {
    applyConvenioProcedureValue(procedureCode);
    // Delay so a click on a dropdown option (onMouseDown) fires before the
    // list disappears — otherwise the blur closes it first.
    setTimeout(() => setShowTussOptions(false), 150);
  };

  const handleSelectTussOption = (option: TussProcedureOption) => {
    skipTussCodeSearchRef.current = true;
    setProcedureCode(option.code);
    setShowTussOptions(false);
    applyConvenioProcedureValue(option.code);
  };

  const handleProcedureBlur = () => {
    // Delay so a click on a dropdown option (onMouseDown) fires before the
    // list disappears — otherwise the blur closes it first.
    setTimeout(() => setShowProcedureOptions(false), 150);
  };

  // Picking a procedure from the TUSS list also fills in its code, so the
  // convênio-guide code field (and its value auto-fill) is already correct if
  // the user later switches the payment method to Convênio.
  const handleSelectProcedureOption = (option: TussProcedureOption) => {
    skipProcedureSearchRef.current = true;
    skipTussCodeSearchRef.current = true;
    setProcedure(option.name);
    setProcedureCode(option.code);
    setShowProcedureOptions(false);
    applyConvenioProcedureValue(option.code);
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
        convenioId: formConvenioId || null,
        procedureCode: procedureCode || null,
        authorizationNumber: authorizationNumber || null,
        insurancePlanName: insurancePlanName || null,
        insuranceCardNumber: insuranceCardNumber || null,
        grossValue: parseFloat(grossValue),
        discountValue: 0,
        netValue: parseFloat(grossValue),
        paymentMethod,
        status,
        dueDate,
      });
      setProcedure("");
      setGrossValue("");
      setProcedureCode("");
      setAuthorizationNumber("");
      setInsurancePlanName("");
      setInsuranceCardNumber("");
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

  const totalRevenuesAll = useMemo(
    () => revenues.reduce((sum, item) => sum + (Number(item.netValue) || 0), 0),
    [revenues],
  );
  const overdueRevenuesCount = useMemo(
    () => revenues.filter((item) => item.status === "VENCIDO").length,
    [revenues],
  );
  const overdueRevenuesTotal = useMemo(
    () =>
      revenues
        .filter((item) => item.status === "VENCIDO")
        .reduce((sum, item) => sum + (Number(item.netValue) || 0), 0),
    [revenues],
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
        {/* Metrics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center justify-between hover:shadow-lg transition-all duration-300">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Receitas
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                R${" "}
                {totalRevenuesAll.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </h2>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 border border-rose-100">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center justify-between hover:shadow-lg transition-all duration-300">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vencidos
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                R${" "}
                {overdueRevenuesTotal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </h2>
              <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {overdueRevenuesCount} faturas vencidas
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-primary text-white p-6 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-md">
            <div>
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-blue-200">
                Ação Administrativa
              </p>
              <h4 className="font-bold text-base mt-1">
                Faturamento de Receitas
              </h4>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-white text-blue-600 hover:bg-slate-50 font-bold text-xs py-2.5 px-4 rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Faturar Guia / Consulta
              </button>
            </div>
          </div>
        </section>

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
                <div className="relative">
                  <input
                    type="text"
                    value={procedure}
                    onChange={(e) => setProcedure(e.target.value)}
                    onFocus={() => setShowProcedureOptions(displayedProcedureOptions.length > 0)}
                    onBlur={handleProcedureBlur}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                    placeholder="Buscar por código ou nome"
                    autoComplete="off"
                    required
                  />
                  {showProcedureOptions && displayedProcedureOptions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                      {isShowingCommonProcedures && (
                        <li className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                          Mais usados por esta clínica
                        </li>
                      )}
                      {displayedProcedureOptions.map((option) => (
                        <li key={option.code}>
                          <button
                            type="button"
                            onMouseDown={() => handleSelectProcedureOption(option)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-50 last:border-b-0"
                          >
                            <span className="font-mono font-bold text-slate-700">
                              {option.code}
                            </span>
                            <span className="text-slate-500"> — {option.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Médico
                </label>
                <CustomSelect
                  value={doctorId}
                  onChange={(id) => {
                    setDoctorId(id);
                    const chosen = doctors.find((d) => d.id === id);
                    if (chosen?.specialty) setSpecialty(chosen.specialty);
                  }}
                  options={doctors.map((d) => ({ value: d.id, label: d.name }))}
                  placeholder="Selecione..."
                />
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
                <CustomSelect
                  value={specialty}
                  onChange={setSpecialty}
                  options={specialtyOptions.map((s) => ({ value: s, label: s }))}
                />
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
                <CustomSelect
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  options={[
                    { value: "Particular", label: "Particular" },
                    { value: "Convênio", label: "Convênio" },
                    { value: "Cartão Crédito", label: "Cartão Crédito" },
                    { value: "Cartão Débito", label: "Cartão Débito" },
                    { value: "PIX", label: "PIX" },
                  ]}
                />
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
                <CustomSelect
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "PENDENTE", label: "Pendente" },
                    { value: "PAGO", label: "Pago" },
                    { value: "FATURADO", label: "Faturado" },
                  ]}
                />
              </div>
            </div>

            {paymentMethod === "Convênio" && (
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Dados da Guia
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Convênio
                    </label>
                    <select
                      value={formConvenioId}
                      onChange={(e) => setFormConvenioId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                    >
                      <option value="">Selecione...</option>
                      {convenios.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Código do Procedimento (TUSS)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={procedureCode}
                        onChange={(e) => setProcedureCode(e.target.value)}
                        onFocus={() => setShowTussOptions(tussOptions.length > 0)}
                        onBlur={handleProcedureCodeBlur}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-hidden"
                        placeholder="Digite o código ou o nome do procedimento"
                        autoComplete="off"
                      />
                      {showTussOptions && tussOptions.length > 0 && (
                        <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                          {tussOptions.map((option) => (
                            <li key={option.code}>
                              <button
                                type="button"
                                onMouseDown={() => handleSelectTussOption(option)}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-50 last:border-b-0"
                              >
                                <span className="font-mono font-bold text-slate-700">
                                  {option.code}
                                </span>
                                <span className="text-slate-500"> — {option.name}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Nº Autorização
                    </label>
                    <input
                      type="text"
                      value={authorizationNumber}
                      onChange={(e) => setAuthorizationNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Plano
                    </label>
                    <select
                      value={insurancePlanName}
                      onChange={(e) => setInsurancePlanName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                    >
                      <option value="">
                        {convenioPlans.length === 0
                          ? "Nenhum plano cadastrado para este convênio"
                          : "Selecione..."}
                      </option>
                      {convenioPlans.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Nº Carteirinha
                    </label>
                    <input
                      type="text"
                      value={insuranceCardNumber}
                      onChange={(e) => setInsuranceCardNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </div>
            )}

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
