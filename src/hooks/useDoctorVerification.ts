import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getVerificationStatus,
  type VerificationStatus,
} from "../services/doctorDocuments";

/**
 * Resolves whether the logged-in doctor's professional verification is
 * approved. Secretaries and patients have no credentials of their own, so
 * verification never applies to them (`applicable: false`, `isApproved: true`).
 */
export function useDoctorVerification() {
  const { user } = useAuth();
  const applicable = user?.type === "doctor" && user?.role !== "secretary";

  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(applicable);

  useEffect(() => {
    if (!applicable) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getVerificationStatus()
      .then((result) => {
        if (!cancelled) setStatus(result.verificationStatus);
      })
      .catch(() => {
        // Keep status unresolved; callers treat unresolved as not approved.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applicable]);

  return {
    status,
    isApproved: !applicable || status === "APPROVED",
    loading,
    applicable,
  };
}
