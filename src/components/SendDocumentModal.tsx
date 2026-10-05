import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

type Choice = "no-signature" | "sign";
type Step = "choose" | "working" | "awaiting-signature" | "done" | "error";

/**
 * "Como deseja enviar?" — shared by Prescriptions and (soon) Exams, so the
 * send/sign UX stays identical across every document type instead of each
 * feature growing its own copy. Knows nothing about Prescription/Exam
 * shapes — the parent supplies the three async actions and this component
 * only orchestrates the steps (choose → working → awaiting signature → done).
 *
 * The "assinar digitalmente" path opens a new tab to our own signature
 * simulator (stand-in for DocuSign's hosted signing page) and polls the
 * backend until the parent reports the signature as complete — there is no
 * WebSocket/webhook infra in this app yet, so polling is the simple, honest
 * way to reflect "the doctor went and signed in the other tab" back here.
 */
export function SendDocumentModal({
  isOpen,
  onClose,
  documentLabel,
  onSendWithoutSignature,
  onRequestSignature,
  onPollSignature,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** e.g. "receita", "pedido de exame" — used only in copy. */
  documentLabel: string;
  onSendWithoutSignature: () => Promise<{ documentUrl: string | null }>;
  onRequestSignature: () => Promise<{ signingUrl: string }>;
  /** Polled every few seconds while awaiting signature. Returns `signed` once
   * the simulator page confirms, or `failed` if the request could not be
   * completed. */
  onPollSignature: () => Promise<{
    signed: boolean;
    failed: boolean;
    documentUrl: string | null;
  }>;
}) {
  const [step, setStep] = useState<Step>("choose");
  const [choice, setChoice] = useState<Choice | null>(null);
  const [signed, setSigned] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => stopPolling, []);

  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      setStep("choose");
      setChoice(null);
      setSigned(false);
      setResultUrl(null);
      setErrorMessage("");
      setSigningUrl(null);
    }
  }, [isOpen]);

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const result = await onPollSignature();
        if (result.signed) {
          stopPolling();
          setSigned(true);
          setResultUrl(result.documentUrl);
          setStep("done");
        } else if (result.failed) {
          stopPolling();
          setErrorMessage("A assinatura não foi concluída. Tente novamente.");
          setStep("error");
        }
      } catch {
        // A transient polling failure isn't fatal — keep trying until the
        // next tick instead of surfacing an error for a single missed check.
      }
    }, 2500);
  }

  async function handleContinue() {
    if (!choice) return;
    setErrorMessage("");

    // Browsers only allow `window.open` without being blocked as a popup
    // when it runs synchronously inside a user gesture (this click). Once
    // we `await` the signature-request call first, the gesture has expired
    // by the time we'd call `window.open(url)` — most browsers then block
    // it silently (no error, the tab just never appears). The fix is to
    // open a blank tab *now*, before the await, and navigate it once we
    // know the URL. `noopener`/`noreferrer` are deliberately omitted here:
    // either one makes `window.open` return null, and we need the handle
    // to redirect it later — safe since the simulator page is our own,
    // same-origin code, not a third-party link.
    const signingWindow = choice === "sign" ? window.open("", "_blank") : null;

    setStep("working");
    try {
      if (choice === "no-signature") {
        const result = await onSendWithoutSignature();
        setSigned(false);
        setResultUrl(result.documentUrl);
        setStep("done");
      } else {
        const { signingUrl: url } = await onRequestSignature();
        setSigningUrl(url);
        if (signingWindow && !signingWindow.closed) {
          signingWindow.location.href = url;
        }
        // If the tab still didn't open (some browsers/extensions block even
        // the synchronous blank-tab open), the "Reabrir a aba de assinatura"
        // link in the next step lets the doctor open it manually.
        setStep("awaiting-signature");
        startPolling();
      }
    } catch (err) {
      signingWindow?.close();
      setErrorMessage(
        err instanceof Error ? err.message : "Não foi possível concluir o envio.",
      );
      setStep("error");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      label="Envio"
      title="Como deseja enviar?"
      showFooter={false}
    >
      <div className="px-8 pb-8 space-y-5">
        {step === "choose" && (
          <>
            <div className="space-y-3">
              {(
                [
                  {
                    value: "no-signature" as const,
                    title: "Enviar sem assinatura digital",
                    description: `O paciente recebe a ${documentLabel} gerada, sem assinatura.`,
                  },
                  {
                    value: "sign" as const,
                    title: "Assinar digitalmente e enviar",
                    description:
                      "Abre uma aba para você assinar; o paciente recebe assim que a assinatura for concluída.",
                  },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    choice === option.value
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="send-choice"
                    className="mt-0.5"
                    checked={choice === option.value}
                    onChange={() => setChoice(option.value)}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {option.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                size="md"
                fullWidth
                className="shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!choice}
                variant="primary"
                size="md"
                fullWidth
              >
                Continuar
              </Button>
            </div>
          </>
        )}

        {step === "working" && (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-slate-600">
              {choice === "sign"
                ? "Preparando a assinatura..."
                : "Enviando ao paciente..."}
            </p>
          </div>
        )}

        {step === "awaiting-signature" && (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-bold text-slate-800">
              Aguardando a assinatura na aba aberta...
            </p>
            <p className="text-xs text-slate-500">
              Assim que você concluir a assinatura por lá, esta tela atualiza
              automaticamente.
            </p>
            {signingUrl && (
              <a
                href={signingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <ExternalLink size={13} />
                Reabrir a aba de assinatura
              </a>
            )}
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="sm"
              className="shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200 mt-2"
            >
              Fechar (a assinatura continua pendente)
            </Button>
          </div>
        )}

        {step === "done" && (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
            <p className="text-base font-bold text-slate-900">
              {documentLabel.charAt(0).toUpperCase() + documentLabel.slice(1)}{" "}
              enviada com sucesso
            </p>
            <p className="text-sm text-slate-500">
              {signed
                ? "Foi assinada digitalmente e enviada ao paciente."
                : "Foi enviada ao paciente, sem assinatura digital."}
            </p>
            <div className="flex gap-3 w-full pt-2">
              {resultUrl && (
                <a
                  href={resultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Button type="button" variant="outline" size="md" fullWidth>
                    Visualizar documento
                  </Button>
                </a>
              )}
              <Button
                type="button"
                onClick={onClose}
                variant="primary"
                size="md"
                fullWidth
              >
                Fechar
              </Button>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <XCircle className="w-10 h-10 text-red-500" />
            <p className="text-sm font-bold text-slate-800">
              {errorMessage || "Não foi possível concluir o envio."}
            </p>
            <div className="flex gap-3 w-full pt-2">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                size="md"
                fullWidth
                className="shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Fechar
              </Button>
              <Button
                type="button"
                onClick={() => setStep("choose")}
                variant="primary"
                size="md"
                fullWidth
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
