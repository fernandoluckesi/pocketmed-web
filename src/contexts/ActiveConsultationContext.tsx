import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "hispora_active_consultation";

export interface ActiveConsultationInfo {
  appointmentId: string;
  /** Null for dependent-only appointments, which have no patient record to open. */
  patientId: string | null;
  patientName: string;
  /** ISO datetime of the scheduled appointment (not when the timer started). */
  dateTime: string;
  /** ISO datetime the consultation timer started. */
  startedAt: string;
}

interface ActiveConsultationContextValue {
  activeConsultation: ActiveConsultationInfo | null;
  elapsedSeconds: number;
  startConsultation: (info: ActiveConsultationInfo) => void;
  /** Clears the active consultation — only if `appointmentId` matches the one
   * currently active, so finishing some other consultation elsewhere can't
   * accidentally clear a different one that's genuinely still running. */
  endConsultation: (appointmentId: string) => void;
}

const ActiveConsultationContext =
  createContext<ActiveConsultationContextValue | null>(null);

/** Guards against a shape saved by an older version of this context (e.g.
 * before `patientId` existed) — silently keeping a stale/incomplete object
 * around would make the header banner (and its click-to-open) misbehave in
 * ways that look like a bug instead of just stale local cache. Nothing is
 * lost by discarding it: the real `startedAt` lives on the appointment in
 * the backend regardless of this local display cache. */
function isValidStored(value: unknown): value is ActiveConsultationInfo {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.appointmentId === "string" &&
    typeof v.startedAt === "string" &&
    typeof v.patientName === "string" &&
    typeof v.dateTime === "string" &&
    (v.patientId === null || typeof v.patientId === "string")
  );
}

function readStored(): ActiveConsultationInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidStored(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Tracks the doctor's single in-progress consultation across the whole app —
 * started from the appointment modal/list, visible in the header from any
 * screen, cleared when the consultation is finalized in the patient record.
 * Persisted to localStorage so a page refresh doesn't lose the running timer.
 */
export function ActiveConsultationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeConsultation, setActiveConsultation] =
    useState<ActiveConsultationInfo | null>(() => readStored());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeConsultation) return;

    const startMs = new Date(activeConsultation.startedAt).getTime();
    const tick = () =>
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeConsultation]);

  function startConsultation(info: ActiveConsultationInfo) {
    setActiveConsultation(info);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {
      // Best-effort — the in-memory state still works for this tab/session.
    }
  }

  function endConsultation(appointmentId: string) {
    setActiveConsultation((prev) => {
      if (!prev || prev.appointmentId !== appointmentId) return prev;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore — state is already clearing below.
      }
      return null;
    });
  }

  return (
    <ActiveConsultationContext.Provider
      value={{ activeConsultation, elapsedSeconds, startConsultation, endConsultation }}
    >
      {children}
    </ActiveConsultationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useActiveConsultation(): ActiveConsultationContextValue {
  const ctx = useContext(ActiveConsultationContext);
  if (!ctx) {
    throw new Error(
      "useActiveConsultation must be used within an ActiveConsultationProvider",
    );
  }
  return ctx;
}
