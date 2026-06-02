import { api } from "./api";

// --- Types ---

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  profileImage: string | null;
  type: string;
  isShadow: boolean;
  cpf?: string;
  bloodType?: string;
  allergies?: string[];
  hasPermission?: boolean;
  hasAccess?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  reason: string;
  status: string;
  isCompleted: boolean;
  doctorFeedback: string | null;
  doctorInstructions: string | null;
  doctorName: string;
  doctorSpecialty: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  doctorId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Exam {
  id: string;
  patientId: string;
  doctorId: string;
  name: string;
  type: string;
  date: string;
  result: string | null;
  fileUrl: string | null;
  createdAt: string;
}

export interface MedicalRecord {
  patient: Patient;
  appointments: Consultation[];
  medications: Medication[];
  exams: Exam[];
}

export interface PatientSummary {
  accessiblePatientsCount: number;
}

export interface AccessRequest {
  id: string;
  doctorId: string;
  patientId: string;
  status: string;
  createdAt: string;
  patient?: { name: string; email: string; profileImage: string | null };
}

// --- API Calls ---

export const patientsApi = {
  // Summary stats
  getSummary: (): Promise<PatientSummary> => api("/patients/stats/summary"),

  // Get patients accessible by current professional
  getMyPatients: (): Promise<Patient[]> => api("/patients/my"),

  // Get all patients (doctors/admin)
  getAll: (): Promise<Patient[]> => api("/patients"),

  // Search patients by name or email
  search: (query: string): Promise<Patient[]> => api(`/patients/search?q=${encodeURIComponent(query)}`),

  // Get patient by ID
  getById: (id: string): Promise<Patient> => api(`/patients/${id}`),

  // Get full medical record
  getMedicalRecord: (id: string): Promise<MedicalRecord> => api(`/patients/${id}/medical-record`),

  // Get consultations with optional date filters
  getConsultations: (id: string, startDate?: string, endDate?: string): Promise<Consultation[]> => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const qs = params.toString();
    return api(`/patients/${id}/consultations${qs ? `?${qs}` : ""}`);
  },

  // Get medications
  getMedications: (id: string): Promise<Medication[]> => api(`/patients/${id}/medications`),

  // Get exams
  getExams: (id: string): Promise<Exam[]> => api(`/patients/${id}/exams`),

  // Create consultation
  createConsultation: (patientId: string, data: {
    date: string;
    symptoms?: string;
    diagnosis?: string;
    prescription?: string;
    notes?: string;
    priority?: string;
  }): Promise<Consultation> => api(`/patients/${patientId}/consultations`, { method: "POST", body: data }),

  // Prescribe medication
  prescribeMedication: (patientId: string, data: {
    name: string;
    dosage: string;
    frequency: string;
    type?: string;
    startDate: string;
    endDate?: string;
    notes?: string;
  }): Promise<Medication> => api(`/patients/${patientId}/medications`, { method: "POST", body: data }),

  // Update patient data
  updatePatient: (id: string, data: {
    name?: string;
    phone?: string;
    gender?: string;
    birthDate?: string;
    profileImage?: string;
  }): Promise<Patient> => api(`/patients/${id}`, { method: "PUT", body: data }),

  // Access requests
  requestAccess: (patientId: string): Promise<{ message: string }> =>
    api("/doctors/request-access", { method: "POST", body: { patientId } }),

  // Get sent access requests
  getSentRequests: (): Promise<AccessRequest[]> => api("/doctors/access-requests/me"),

  // Cancel access request
  cancelRequest: (requestId: string): Promise<void> => api(`/doctors/access-requests/${requestId}`, { method: "DELETE" }),

  // Timeline
  getTimeline: (patientId: string, limit = 50): Promise<Array<{ type: string; date: string; title: string; description: string; data: unknown }>> =>
    api(`/patients/${patientId}/timeline?limit=${limit}`),

  // Alerts
  getAlerts: (patientId: string): Promise<{ patient: { id: string; name: string }; alerts: Array<{ type: string; severity: string; message: string; details?: string }> }> =>
    api(`/patients/${patientId}/alerts`),

  // Access log (audit)
  getAccessLog: (patientId: string): Promise<Array<{ id: string; patientId: string; accessedBy: string; action: string; details: string | null; createdAt: string }>> =>
    api(`/patients/${patientId}/access-log`),
};
