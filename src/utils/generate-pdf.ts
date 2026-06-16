import { jsPDF } from "jspdf";
import QRCode from "qrcode";

interface DoctorInfo {
  name: string;
  crm: string;
  specialty?: string;
  rqe?: string;
}

interface PatientInfo {
  name: string;
  cpf?: string;
}

// --- Shared helpers ---

function formatDateTime(): string {
  const now = new Date();
  const date = now.toLocaleDateString("pt-BR");
  const time = now.toLocaleTimeString("pt-BR", { hour12: false });
  return `${date} - ${time} (GMT-3)`;
}

async function generateQRCodeDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 80, margin: 1 });
}

function drawHeader(doc: jsPDF, doctor: DoctorInfo) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Doctor name (centered, italic, bold)
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(16);
  const drPrefix = doctor.name.toLowerCase().startsWith("dr") ? "" : "Dr(a). ";
  doc.text(`${drPrefix}${doctor.name}`, pageWidth / 2, 30, { align: "center" });

  // CRM and specialty (centered, italic, smaller)
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  const crmLine = `CRM: ${doctor.crm}${doctor.specialty ? ` - ${doctor.specialty}` : ""}`;
  doc.text(crmLine, pageWidth / 2, 38, { align: "center" });

  // Separator line
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(20, 44, pageWidth - 20, 44);
}

function drawPatientInfo(doc: jsPDF, patient: PatientInfo) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Nome:", 20, 58);
  doc.setFont("helvetica", "normal");
  doc.text(patient.name.toUpperCase(), 40, 58);

  if (patient.cpf) {
    doc.setFont("helvetica", "bold");
    doc.text("CPF:", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(patient.cpf, 35, 65);
  }
}

function drawDatetime(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Data e hora:", pageWidth - 80, 58);
  doc.setFont("helvetica", "normal");
  doc.text(formatDateTime(), pageWidth - 55, 58);
}

async function drawFooter(doc: jsPDF, doctor: DoctorInfo) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // QR Code
  const qrText = `PocketMed - Documento assinado digitalmente por ${doctor.name} - CRM ${doctor.crm}`;
  const qrDataUrl = await generateQRCodeDataUrl(qrText);
  doc.addImage(qrDataUrl, "PNG", 20, pageHeight - 75, 22, 22);

  // Footer text next to QR
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("POCKETMED - Acesso à sua receita digital via QR Code", 46, pageHeight - 70);
  doc.setFont("helvetica", "normal");
  doc.text(`Assinado digitalmente por ${doctor.name.toUpperCase()} - CRM ${doctor.crm}`, 46, pageHeight - 65);

  // Clinic line (centered)
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("PocketMed - Plataforma de Saúde Digital", pageWidth / 2, pageHeight - 45, { align: "center" });

  // Bottom validation line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text(
    "*Para validar assinatura deste documento, acesse https://pocketmed.com.br/validar",
    20,
    pageHeight - 20
  );
}

// --- Exam PDF ---

export interface ExamPdfData {
  doctor: DoctorInfo;
  patient: PatientInfo;
  exams: string[];
}

export async function generateExamPdf(data: ExamPdfData): Promise<void> {
  const doc = new jsPDF("portrait", "mm", "a4");

  drawHeader(doc, data.doctor);
  drawPatientInfo(doc, data.patient);
  drawDatetime(doc);

  // "Pedido de Exame" title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Pedido de Exame", 20, 85);

  // Exam list
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  let y = 98;
  data.exams.forEach((exam) => {
    doc.text(exam, 20, y);
    y += 8;
  });

  await drawFooter(doc, data.doctor);

  doc.save(`pedido_exame_${data.patient.name.replace(/\s+/g, "_")}.pdf`);
}

// --- Prescription PDF ---

export interface PrescriptionItem {
  name: string;
  presentation?: string;
  composition?: string;
  instructions?: string;
}

export interface PrescriptionPdfData {
  doctor: DoctorInfo;
  patient: PatientInfo;
  medications: PrescriptionItem[];
}

export async function generatePrescriptionPdf(data: PrescriptionPdfData): Promise<void> {
  const doc = new jsPDF("portrait", "mm", "a4");

  drawHeader(doc, data.doctor);
  drawPatientInfo(doc, data.patient);
  drawDatetime(doc);

  // Medication list
  let y = 85;
  data.medications.forEach((med, index) => {
    // Number + Name bold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const nameText = `${index + 1}. ${med.name}`;
    const presentationText = med.presentation ? `, ${med.presentation}` : "";
    doc.text(nameText, 20, y);

    // Presentation (normal, inline after name)
    if (presentationText) {
      const nameWidth = doc.getTextWidth(nameText);
      doc.setFont("helvetica", "normal");
      doc.text(presentationText, 20 + nameWidth, y);
    }
    y += 6;

    // Composition
    if (med.composition) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`  ${med.composition}`, 20, y);
      y += 5;
    }

    // Instructions
    if (med.instructions) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`  ${med.instructions}`, 20, y);
      y += 5;
    }

    y += 5;
  });

  await drawFooter(doc, data.doctor);

  doc.save(`receita_${data.patient.name.replace(/\s+/g, "_")}.pdf`);
}
