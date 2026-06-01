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
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  profileImage: string | null;
  type: string;
  isShadow: boolean;
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
  specialty?: string;
  location?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  type: string;
  source?: string;
  status?: string;
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
        const data = await api(`/patients/${id}`);
        if (!cancelled) {
          setPatient(data);
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
  }, [id]);

  return { patient, loading, error };
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
}

// --- useCreateShadowPatient ---

export function useCreateShadowPatient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createPatient = useCallback(async (data: CreateShadowPatientData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api("/auth/register/patient-shadow", {
        method: "POST",
        body: data,
      });
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
  }, []);

  return { createPatient, loading, error, success, reset };
}
