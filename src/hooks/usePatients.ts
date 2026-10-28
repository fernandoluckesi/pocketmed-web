import { useState, useEffect, useCallback, useRef } from "react";
import { api, ApiError } from "../services/api";

// --- Retry utility ---

async function fetchWithRetry(
  fn: () => Promise<any>,
  retries = 2,
): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

// --- Types ---

export interface PatientFromAPI {
  id: string;
  name: string;
  username?: string | null;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  profileImage: string | null;
  type: string;
  isShadow: boolean;
  inviteEmailStatus?: "sent" | "failed" | null;
  createdByDoctorId?: string;
  appointments?: Appointment[];
  medications?: Medication[];
  exams?: Exam[];
}

export interface Appointment {
  id: string;
  date: string;
  status: string;
  type: string;
  doctorName?: string;
  doctorId?: string;
  specialty?: string;
  location?: string;
  locationClinicName?: string;
  locationStreet?: string;
  locationNumber?: string;
  locationNeighborhood?: string;
  locationCity?: string;
  locationState?: string;
  notes?: string;
  instructions?: string;
  lockedByDoctor?: boolean;
  visitType?: string;
  paymentType?: string;
  convenioId?: string;
  patientId?: string | null;
  /** Consultation timer, for clinic reporting — omitted entirely for non-doctor viewers by the backend. */
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
}

/** Single-line summary of the consultation's address, for compact display
 * (the appointment list card). The detail view shows the parts separately. */
function formatAppointmentLocation(apt: {
  locationClinicName?: string;
  locationStreet?: string;
  locationNumber?: string;
  locationNeighborhood?: string;
  locationCity?: string;
  locationState?: string;
}): string | undefined {
  const parts: string[] = [];
  if (apt.locationStreet) {
    parts.push(
      apt.locationNumber
        ? `${apt.locationStreet}, ${apt.locationNumber}`
        : apt.locationStreet,
    );
  }
  if (apt.locationNeighborhood) parts.push(apt.locationNeighborhood);
  if (apt.locationCity) {
    parts.push(
      apt.locationState
        ? `${apt.locationCity} - ${apt.locationState}`
        : apt.locationCity,
    );
  } else if (apt.locationState) {
    parts.push(apt.locationState);
  }

  const address = parts.join(", ");
  if (apt.locationClinicName) {
    return address ? `${apt.locationClinicName} - ${address}` : apt.locationClinicName;
  }
  return address || undefined;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  instructions?: string;
  times?: string[];
  lockedByDoctor?: boolean;
  doctorId?: string;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  type: string;
  source?: string;
  status?: string;
  description?: string;
  batchId?: string;
  completedAt?: string;
  resultFiles?: string[];
  doctorId?: string;
}

export interface PatientStats {
  totalPatients: number;
  activePatients: number;
  shadowPatients: number;
  recentAppointments: number;
}

// --- useMyPatients ---

export function useMyPatients(retryCount = 2) {
  const [patients, setPatients] = useState<PatientFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithRetry(() => api("/patients/my"), retryCount);
      setPatients(Array.isArray(data) ? data : data.patients || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar pacientes",
      );
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return { patients, loading, error, refetch: fetchPatients };
}

// --- useSearchPatients ---

export function useSearchPatients(query: string) {
  const [results, setResults] = useState<PatientFromAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api(
          `/patients/search?q=${encodeURIComponent(query.trim())}`,
        );
        setResults(Array.isArray(data) ? data : data.patients || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro na busca");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  return { results, loading, error };
}

// --- usePatientDetail ---

export function usePatientDetail(id: string | undefined) {
  const [patient, setPatient] = useState<PatientFromAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPatient() {
      setLoading(true);
      setError(null);
      try {
        // Fetch basic patient data and medical record in parallel
        const [patientData, medicalRecord] = await Promise.all([
          api(`/patients/${id}`),
          api(`/patients/${id}/medical-record`).catch(() => null),
        ]);

        if (!cancelled) {
          const merged: PatientFromAPI = {
            ...patientData,
            appointments: medicalRecord?.appointments?.map((apt: any) => ({
              id: apt.id,
              date: apt.dateTime || apt.date,
              status: apt.status || (apt.isCompleted ? "completed" : "scheduled"),
              type: apt.reason || apt.type || "Consulta",
              doctorName: apt.doctorName || undefined,
              doctorId: apt.doctorId || undefined,
              specialty: apt.doctorSpecialty || apt.specialty || undefined,
              location: formatAppointmentLocation(apt),
              locationClinicName: apt.locationClinicName || undefined,
              locationStreet: apt.locationStreet || undefined,
              locationNumber: apt.locationNumber || undefined,
              locationNeighborhood: apt.locationNeighborhood || undefined,
              locationCity: apt.locationCity || undefined,
              locationState: apt.locationState || undefined,
              notes: apt.doctorFeedback || apt.notes || undefined,
              instructions: apt.doctorInstructions || undefined,
              lockedByDoctor: apt.lockedByDoctor || false,
              visitType: apt.visitType || undefined,
              paymentType: apt.paymentType || undefined,
              convenioId: apt.convenioId || undefined,
              startedAt: apt.startedAt || undefined,
              endedAt: apt.endedAt || undefined,
              durationSeconds: apt.durationSeconds ?? undefined,
            })) || [],
            medications: medicalRecord?.medications?.map((med: any) => ({
              id: med.id,
              name: med.name,
              dosage: med.dosage || "",
              frequency: med.frequency || "",
              startDate: med.startDate,
              endDate: med.endDate,
              active: med.isActive ?? med.active ?? true,
              instructions: med.instructions || undefined,
              times: Array.isArray(med.times) ? med.times : undefined,
              lockedByDoctor: med.lockedByDoctor || false,
              doctorId: med.doctorId || undefined,
            })) || [],
            exams: medicalRecord?.exams?.map((exam: any) => ({
              id: exam.id,
              title: exam.title || exam.name || "Exame",
              date: exam.date || exam.scheduledDate || exam.createdAt,
              type: exam.type || "Exame",
              source: exam.source || exam.laboratory || undefined,
              status: exam.status || undefined,
              description: exam.description || undefined,
              batchId: exam.batchId || undefined,
              completedAt: exam.completedAt || undefined,
              resultFiles: exam.resultFiles || undefined,
              doctorId: exam.doctorId || undefined,
            })) || [],
          };
          setPatient(merged);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Erro ao carregar paciente",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPatient();

    return () => {
      cancelled = true;
    };
  }, [id, refreshKey]);

  return { patient, loading, error, refetch };
}

// --- usePatientStats ---

export function usePatientStats() {
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api("/patients/stats/summary");
        setStats(data);
      } catch {
        // Stats are non-critical, fail silently
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading };
}

// --- Types for Access Requests ---

export interface AccessRequest {
  id: string;
  patientId: string;
  dependentId?: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt: string;
  patient?: {
    id: string;
    name: string;
    email?: string;
    profileImage?: string | null;
  };
}

// --- useAccessRequests ---

export function useAccessRequests(retryCount = 2) {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithRetry(
        () => api("/doctors/access-requests/me"),
        retryCount,
      );
      setRequests(Array.isArray(data) ? data : data.requests || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar solicitações",
      );
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, refetch: fetchRequests };
}

// --- useCancelAccessRequest ---

export function useCancelAccessRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelRequest = useCallback(async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api(`/doctors/access-requests/${requestId}`, {
        method: "DELETE",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao cancelar solicitação",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { cancelRequest, loading, error };
}

// --- useRequestAccess ---

export function useRequestAccess() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const requestAccess = useCallback(
    async (patientId: string, message?: string) => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        await api("/doctors/request-access", {
          method: "POST",
          body: { patientId, message },
        });
        setSuccess(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao solicitar acesso",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return { requestAccess, loading, error, success, reset };
}

// --- Types for Shadow Patient ---

export interface CreateShadowPatientData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  doctorCreatorId: string;
  cpf?: string;
}

// --- useCreateShadowPatient ---

export function useCreateShadowPatient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inviteEmailStatus, setInviteEmailStatus] = useState<
    "sent" | "failed" | null
  >(null);

  const createPatient = useCallback(async (data: CreateShadowPatientData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setInviteEmailStatus(null);
    try {
      const result = await api("/auth/register/patient-shadow", {
        method: "POST",
        body: data,
      });
      setInviteEmailStatus(result?.inviteEmailStatus ?? "sent");
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Já existe um paciente cadastrado com este email.");
      } else {
        setError(
          err instanceof Error ? err.message : "Erro ao cadastrar paciente.",
        );
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setInviteEmailStatus(null);
  }, []);

  return { createPatient, loading, error, success, inviteEmailStatus, reset };
}

// --- Cross-clinic access (patient Shadow authorization flow) ---

export interface PatientLookupResult {
  found: boolean;
  /** Only meaningful when `found` is true — the doctor is already the
   * creator or already holds an active permission for this patient. */
  alreadyAccessible?: boolean;
  patientId?: string;
  name?: string;
}

export function useLookupPatientByEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(
    async (email: string): Promise<PatientLookupResult> => {
      setLoading(true);
      setError(null);
      try {
        return await api("/doctors/patients/lookup-by-email", {
          method: "POST",
          body: { email },
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao buscar paciente.",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { lookup, loading, error };
}

export interface RequestCrossClinicAccessResult {
  id: string;
  status: string;
  channel: "in_app" | "email_link";
  emailStatus?: "sent" | "failed";
}

export function useRequestCrossClinicAccess() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCrossClinicAccess = useCallback(
    async (
      patientId: string,
      purpose: string,
    ): Promise<RequestCrossClinicAccessResult> => {
      setLoading(true);
      setError(null);
      try {
        return await api(
          `/doctors/patients/${patientId}/request-cross-clinic-access`,
          { method: "POST", body: { purpose } },
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao solicitar autorização.",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { requestCrossClinicAccess, loading, error };
}

export function useResendCrossClinicLink() {
  const [loading, setLoading] = useState(false);

  const resendCrossClinicLink = useCallback(
    async (requestId: string): Promise<{ emailStatus: "sent" | "failed" }> => {
      setLoading(true);
      try {
        return await api(
          `/doctors/access-requests/${requestId}/resend-cross-clinic-link`,
          { method: "POST" },
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { resendCrossClinicLink, loading };
}

// --- useResendInvite ---

export function useResendInvite() {
  const [resendingId, setResendingId] = useState<string | null>(null);

  const resendInvite = useCallback(
    async (patientId: string): Promise<"sent" | "failed"> => {
      setResendingId(patientId);
      try {
        const result = await api(`/patients/${patientId}/resend-invite`, {
          method: "POST",
        });
        return result?.inviteEmailStatus ?? "failed";
      } finally {
        setResendingId((current) => (current === patientId ? null : current));
      }
    },
    [],
  );

  return { resendInvite, resendingId };
}
