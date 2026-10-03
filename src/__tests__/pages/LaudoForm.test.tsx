import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LaudoForm } from "../../pages/Laudos/LaudoForm";

// The rich-text editor pulls in ProseMirror, which needs a real layout to
// behave. Swapped for a textarea that emits the same shape the backend
// expects (a ProseMirror doc), keeping this a test of the form's own logic.
vi.mock("../../components/ui/RichTextEditor", () => ({
  RichTextEditor: ({
    label,
    onChange,
  }: {
    label: string;
    onChange: (value: unknown) => void;
  }) =>
    React.createElement("textarea", {
      "aria-label": label,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        onChange(
          e.target.value
            ? {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: e.target.value }],
                  },
                ],
              }
            : null,
        ),
    }),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      userId: "doctor-1",
      name: "Dra. Ana Souza",
      crm: "100001/SP",
      specialty: "Cardiologia",
      type: "doctor",
      role: "doctor",
    },
  }),
}));

const create = vi.fn();
const update = vi.fn();
const attachFile = vi.fn();
const removeFile = vi.fn();

vi.mock("../../services/reports", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    reportsApi: {
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
      attachFile: (...args: unknown[]) => attachFile(...args),
      removeFile: (...args: unknown[]) => removeFile(...args),
    },
  };
});

const PATIENT_ID = "patient-1";

function renderForm(
  props: Partial<React.ComponentProps<typeof LaudoForm>> = {},
) {
  const onSaved = vi.fn();
  const onClose = vi.fn();
  render(
    <LaudoForm
      patientId={PATIENT_ID}
      onClose={onClose}
      onSaved={onSaved}
      variant="inline"
      {...props}
    />,
  );
  return { onSaved, onClose };
}

describe("LaudoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    create.mockResolvedValue({ id: "report-1", fileUrl: null });
    update.mockResolvedValue({ id: "report-1", fileUrl: null });
    attachFile.mockResolvedValue({
      id: "report-1",
      fileUrl: "https://files.example/medical-documents/laudo.pdf",
    });
  });

  it("shows the doctor's identification as read-only", () => {
    renderForm();

    expect(screen.getByText("Dra. Ana Souza")).toBeInTheDocument();
    // CRM is split into number and UF for display.
    expect(screen.getByText("100001")).toBeInTheDocument();
    expect(screen.getByText("SP")).toBeInTheDocument();
    // None of it is editable here — it comes from the authenticated profile.
    expect(
      screen.queryByRole("textbox", { name: /médico/i }),
    ).not.toBeInTheDocument();
  });

  it("refuses to save a laudo with neither content nor an attachment", async () => {
    const user = userEvent.setup();
    const { onSaved } = renderForm();

    await user.type(screen.getByLabelText("Título"), "Laudo de teste");
    await user.click(screen.getByRole("button", { name: /salvar laudo/i }));

    expect(
      await screen.findByText(
        /Preencha pelo menos um campo do laudo ou anexe um documento existente/i,
      ),
    ).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("saves a laudo written in the form", async () => {
    const user = userEvent.setup();
    const { onSaved } = renderForm();

    await user.type(screen.getByLabelText("Título"), "Laudo de acompanhamento");
    await user.type(screen.getByLabelText("Diagnóstico"), "Hipertensão");
    await user.click(screen.getByRole("button", { name: /salvar laudo/i }));

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: PATIENT_ID,
        title: "Laudo de acompanhamento",
        reportType: "laudo_medico",
        diagnosis: expect.objectContaining({ type: "doc" }),
      }),
    );
    expect(onSaved).toHaveBeenCalled();
    // Nothing to upload — the attachment endpoint stays untouched.
    expect(attachFile).not.toHaveBeenCalled();
  });

  it("accepts an attachment alone, with no content typed in", async () => {
    const user = userEvent.setup();
    const { onSaved } = renderForm();

    await user.type(screen.getByLabelText("Título"), "Laudo de 2019");
    const file = new File(["%PDF-1.7"], "laudo-2019.pdf", {
      type: "application/pdf",
    });
    await user.upload(screen.getByLabelText(/Anexar Laudo Existente/i), file);
    await user.click(screen.getByRole("button", { name: /salvar laudo/i }));

    expect(create).toHaveBeenCalled();
    // Uploaded separately from the JSON payload, after the laudo exists.
    expect(attachFile).toHaveBeenCalledWith("report-1", file);
    expect(onSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        fileUrl: "https://files.example/medical-documents/laudo.pdf",
      }),
    );
  });

  it('requires a description when the type is "Outro"', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Título"), "Laudo especial");
    await user.type(screen.getByLabelText("Diagnóstico"), "Algo");
    // Open the type select and pick "Outro".
    await user.click(screen.getByRole("button", { name: /laudo médico/i }));
    await user.click(screen.getByRole("button", { name: "Outro" }));
    await user.click(screen.getByRole("button", { name: /salvar laudo/i }));

    expect(
      await screen.findByText(/Descreva o tipo de laudo/i),
    ).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it("locks the form once the laudo is signed", async () => {
    await act(async () => {
      renderForm({
        initial: {
          id: "report-1",
          status: "signed",
          signatureStatus: "signed",
          reportType: "laudo_medico",
          reportTypeOther: null,
          title: "Laudo assinado",
          issueDate: "2026-03-15",
          relatedServiceDate: null,
          purpose: null,
          doctorNameSnapshot: "Dra. Ana Souza",
          doctorCrmSnapshot: "100001/SP",
          doctorSpecialtySnapshot: "Cardiologia",
          patientNameSnapshot: "João da Silva",
          fileUrl: null,
        } as never,
      });
    });

    expect(
      screen.getByText(/já foi assinado e não pode mais ser alterado/i),
    ).toBeInTheDocument();
  });
});
