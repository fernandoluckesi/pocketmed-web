/**
 * Front-end-only mock backing the fictitious demo patient (and their one
 * example dependent). Doctors pending verification browse `/patients/demo`
 * through the exact same PatientDetail screen/flow used for real patients —
 * only the data source changes: these responses are returned instead of
 * calling the real API, and any write is rejected so nothing is (falsely)
 * persisted.
 */

/** Route param used to reach the read-only demo patient experience. */
export const DEMO_PATIENT_ID = "demo";

/** The demo patient's one example dependent, reachable from their "Dependentes" tab. */
export const DEMO_DEPENDENT_ID = "demo-dependente";

const DEMO_IDS = [DEMO_PATIENT_ID, DEMO_DEPENDENT_ID];

export const demoPatientRecord = {
  id: DEMO_PATIENT_ID,
  name: "Maria Exemplo da Silva",
  email: "maria.exemplo@dados-simulados.com",
  phone: "(11) 90000-0000",
  gender: "female",
  birthDate: "1988-04-12",
  profileImage: null,
  type: "patient",
  isShadow: false,
};

const demoDependentRecord = {
  id: DEMO_DEPENDENT_ID,
  name: "Pedro Exemplo Filho",
  email: null,
  phone: null,
  gender: "male",
  birthDate: "2015-06-20",
  profileImage: null,
  type: "patient",
  isShadow: false,
  isDependent: true,
  responsibles: [{ id: DEMO_PATIENT_ID, name: demoPatientRecord.name }],
};

// Raw shape as the real `/patients/:id/medical-record` endpoint returns it —
// `usePatientDetail` maps this into the UI's Appointment/Medication/Exam types.
const demoMedicalRecord = {
  appointments: [
    {
      id: "demo-appointment-1",
      dateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      reason: "Consulta de rotina",
      doctorName: "Dr. Exemplo",
      doctorSpecialty: "Clínica Geral",
      isCompleted: true,
      doctorFeedback: "Paciente sem queixas. Retorno em 6 meses.",
    },
    {
      id: "demo-appointment-2",
      dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
      reason: "Retorno",
      doctorName: "Dr. Exemplo",
      doctorSpecialty: "Clínica Geral",
      isCompleted: false,
    },
  ],
  medications: [
    {
      id: "demo-medication-1",
      name: "Losartana (exemplo)",
      dosage: "50mg",
      frequency: "1x ao dia",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      isActive: true,
    },
  ],
  exams: [
    {
      id: "demo-exam-1",
      title: "Hemograma completo (exemplo)",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      type: "Laboratorial",
      status: "completed",
    },
  ],
};

const demoDependentMedicalRecord = {
  appointments: [
    {
      id: "demo-dependent-appointment-1",
      dateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      reason: "Consulta pediátrica de rotina",
      doctorName: "Dr. Exemplo",
      doctorSpecialty: "Pediatria",
      isCompleted: true,
      doctorFeedback: "Desenvolvimento adequado para a idade.",
    },
  ],
  medications: [],
  exams: [],
};

const demoDiseases = [
  {
    id: "demo-disease-1",
    name: "Hipertensão Arterial (exemplo)",
    description: "Diagnosticada em consulta de rotina.",
    observations: null,
    status: "in_treatment",
    diagnosisDate: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 365,
    ).toISOString(),
    treatmentStartDate: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 365,
    ).toISOString(),
    treatmentEndDate: null,
    doctorId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
  },
];

const demoAllergies = [
  {
    id: "demo-allergy-1",
    name: "Dipirona (exemplo)",
    severity: "moderate",
    reaction: "Urticária",
    notes: null,
    doctorId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(),
  },
];

const demoVaccines = [
  {
    id: "demo-vaccine-1",
    name: "Vacina Influenza (exemplo)",
    dose: "Dose única",
    applicationDate: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 180,
    ).toISOString(),
    nextDoseDate: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 185,
    ).toISOString(),
    laboratory: "Butantan",
    notes: null,
    doctorId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
  },
];

const demoSurgeries = [
  {
    id: "demo-surgery-1",
    name: "Apendicectomia (exemplo)",
    status: "PERFORMED",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 5).toISOString(),
    indication: "Apendicite aguda",
    diagnosisId: null,
    bodyRegion: "Abdômen",
    laterality: "NOT_APPLICABLE",
    hospitalOrClinic: "Hospital Exemplo",
    surgeonName: "Dr. Cirurgião Exemplo",
    surgeonSpecialty: "Cirurgia Geral",
    city: "São Paulo",
    state: "SP",
    surgeryType: "URGENT",
    technique: "LAPAROSCOPIC",
    anesthesia: "GENERAL",
    outcome: "Recuperação sem intercorrências.",
    hadComplications: false,
    complications: null,
    hospitalAdmission: true,
    dischargeDate: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * (365 * 5 - 2),
    ).toISOString(),
    postoperativeNotes: null,
    hasPermanentImplant: false,
    implantType: null,
    implantDescription: null,
    implantManufacturer: null,
    implantModel: null,
    implantSerial: null,
    implantLocation: null,
    doctorId: null,
    createdAt: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 365 * 5,
    ).toISOString(),
  },
];

const demoDependents = [
  {
    id: DEMO_DEPENDENT_ID,
    name: demoDependentRecord.name,
    gender: demoDependentRecord.gender,
    birthDate: demoDependentRecord.birthDate,
    profileImage: null,
    responsibles: demoDependentRecord.responsibles,
  },
];

const EMPTY_LIST: unknown[] = [];

function matchDemoPath(
  path: string,
): { id: string; suffix: string } | null {
  for (const id of DEMO_IDS) {
    const prefix = `/patients/${id}`;
    if (path === prefix) return { id, suffix: "" };
    if (path.startsWith(`${prefix}/`)) {
      return { id, suffix: path.slice(prefix.length) };
    }
  }
  return null;
}

export function isDemoPatientPath(path: string): boolean {
  return matchDemoPath(path) !== null;
}

export function isDemoPatientId(id: unknown): boolean {
  return typeof id === "string" && DEMO_IDS.includes(id);
}

/** Resolves a GET request for the demo patient or its example dependent. */
export function resolveDemoPatientGet(path: string): unknown {
  const match = matchDemoPath(path);
  if (!match) return EMPTY_LIST;
  const { id, suffix } = match;
  const isMainPatient = id === DEMO_PATIENT_ID;

  switch (suffix) {
    case "":
      return isMainPatient ? demoPatientRecord : demoDependentRecord;
    case "/medical-record":
      return isMainPatient ? demoMedicalRecord : demoDependentMedicalRecord;
    case "/diseases":
      return isMainPatient ? demoDiseases : EMPTY_LIST;
    case "/allergies":
      return isMainPatient ? demoAllergies : EMPTY_LIST;
    case "/vaccines":
      return isMainPatient ? demoVaccines : EMPTY_LIST;
    case "/surgeries":
      return isMainPatient ? demoSurgeries : EMPTY_LIST;
    case "/dependents":
      return isMainPatient ? demoDependents : EMPTY_LIST;
    default:
      return EMPTY_LIST;
  }
}

export const DEMO_PATIENT_ACTION_BLOCKED_MESSAGE =
  "Ação indisponível em modo demonstração. Finalize a verificação profissional para gerenciar pacientes reais.";
