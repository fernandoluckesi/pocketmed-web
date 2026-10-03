import { Clock, ShieldCheck } from "lucide-react";
import type { DocumentSpec, RichTextDoc } from "../services/reports";

/**
 * Renders the backend's `DocumentSpec` — the very structure the PDF is drawn
 * from — as an on-screen approximation of the final document. Reading the
 * spec from the server (rather than rebuilding it from form state) is what
 * keeps "Visualizar laudo" honest: if the PDF omits an empty section, so
 * does this.
 */

function formatDate(value?: string | null): string {
  if (!value) return "—";
  // Date-only values (`issueDate`, `birthDate`) come back as 'YYYY-MM-DD'.
  // Parsing those through `new Date()` treats them as UTC midnight and local
  // formatting can shift them back a day — split the string instead.
  const dateOnly = value.slice(0, 10);
  const [year, month, day] = dateOnly.split("-");
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}

/** Minimal structural view of a ProseMirror node — only the parts this
 * renderer (and the PDF renderer it mirrors) actually reads. */
interface PmNode {
  type?: string;
  text?: string;
  attrs?: { level?: number };
  marks?: { type: string }[];
  content?: PmNode[];
}

/** Mirrors `prosemirror-to-pdfkit.ts`: the same node/mark vocabulary, drawn
 * with DOM elements instead of pdfkit calls. */
function RichTextNode({ node }: { node: PmNode }) {
  const children = node.content ?? [];

  switch (node.type) {
    case "text": {
      const marks = node.marks ?? [];
      let content: React.ReactNode = node.text ?? "";
      if (marks.some((m) => m.type === "italic")) content = <em>{content}</em>;
      if (marks.some((m) => m.type === "bold"))
        content = <strong>{content}</strong>;
      return <>{content}</>;
    }
    case "hardBreak":
      return <br />;
    case "paragraph":
      return (
        <p className="text-sm text-slate-700 leading-relaxed mb-2">
          {children.map((child, i) => (
            <RichTextNode key={i} node={child} />
          ))}
        </p>
      );
    case "heading": {
      const level = node.attrs?.level ?? 1;
      const className =
        level === 1
          ? "text-base font-bold text-slate-900 mb-1.5"
          : "text-sm font-bold text-slate-900 mb-1.5";
      const Tag = (level === 1 ? "h4" : "h5") as "h4" | "h5";
      return (
        <Tag className={className}>
          {children.map((child, i) => (
            <RichTextNode key={i} node={child} />
          ))}
        </Tag>
      );
    }
    case "bulletList":
      return (
        <ul className="list-disc pl-5 mb-2 space-y-0.5">
          {children.map((child, i) => (
            <RichTextNode key={i} node={child} />
          ))}
        </ul>
      );
    case "orderedList":
      return (
        <ol className="list-decimal pl-5 mb-2 space-y-0.5">
          {children.map((child, i) => (
            <RichTextNode key={i} node={child} />
          ))}
        </ol>
      );
    case "listItem":
      return (
        <li className="text-sm text-slate-700 [&_p]:mb-0">
          {children.map((child, i) => (
            <RichTextNode key={i} node={child} />
          ))}
        </li>
      );
    case "horizontalRule":
      return <hr className="my-3 border-slate-200" />;
    case "blockquote":
      return (
        <blockquote className="border-l-2 border-slate-200 pl-3">
          {children.map((child, i) => (
            <RichTextNode key={i} node={child} />
          ))}
        </blockquote>
      );
    default:
      return (
        <>
          {children.map((child, i) => (
            <RichTextNode key={i} node={child} />
          ))}
        </>
      );
  }
}

function RichText({ doc }: { doc: RichTextDoc }) {
  return <RichTextNode node={doc as PmNode} />;
}

function IdentityBlock({
  heading,
  lines,
}: {
  heading: string;
  lines: (string | null)[];
}) {
  return (
    <div>
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
        {heading}
      </p>
      {lines
        .filter((line): line is string => !!line)
        .map((line, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "text-sm font-bold text-slate-900"
                : "text-sm text-slate-600"
            }
          >
            {line}
          </p>
        ))}
    </div>
  );
}

export function DocumentPreview({ spec }: { spec: DocumentSpec }) {
  const isSigned = spec.signatureStatus === "signed";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-10 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h3 className="font-display text-xl font-extrabold text-slate-900">
          {spec.title}
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          Hispora — Documento Médico Eletrônico
        </p>
      </div>

      <hr className="border-slate-200" />

      <div className="grid grid-cols-2 gap-6">
        <IdentityBlock
          heading="Médico(a) responsável"
          lines={[
            spec.doctor.name,
            spec.doctor.crm ? `CRM: ${spec.doctor.crm}` : null,
            spec.doctor.specialty
              ? `Especialidade: ${spec.doctor.specialty}`
              : null,
          ]}
        />
        <IdentityBlock
          heading="Paciente"
          lines={[
            spec.patient.name,
            spec.patient.cpf ? `CPF: ${spec.patient.cpf}` : null,
            spec.patient.birthDate
              ? `Data de nascimento: ${formatDate(spec.patient.birthDate)}`
              : null,
            spec.patient.gender ? `Sexo: ${spec.patient.gender}` : null,
          ]}
        />
      </div>

      <p className="text-xs text-slate-400 font-medium">
        Data de emissão: {formatDate(spec.issueDate)}
      </p>

      <hr className="border-slate-200" />

      {spec.sections.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-4 text-center">
          Nenhum conteúdo preenchido ainda. Volte e complete o laudo.
        </p>
      ) : (
        <div className="space-y-5">
          {spec.sections.map((section, index) => {
            if (section.kind === "key-values") {
              return (
                <div key={index} className="space-y-1">
                  {section.heading && (
                    <p className="text-sm font-bold text-slate-900">
                      {section.heading}
                    </p>
                  )}
                  {section.items
                    .filter((item) => item.value)
                    .map((item) => (
                      <p key={item.label} className="text-sm text-slate-700">
                        <span className="font-semibold">{item.label}: </span>
                        {item.value}
                      </p>
                    ))}
                </div>
              );
            }
            if (section.kind === "plain-text") {
              return (
                <div key={index} className="space-y-1">
                  {section.heading && (
                    <p className="text-sm font-bold text-slate-900">
                      {section.heading}
                    </p>
                  )}
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {section.text}
                  </p>
                </div>
              );
            }
            if (!section.content) return null;
            return (
              <div key={index} className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  {section.heading}
                </p>
                <RichText doc={section.content} />
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-8 space-y-2">
        <hr className="border-slate-400" />
        <p className="text-xs text-slate-500 text-center">Assinatura</p>
        {/* Only claims a digital signature when one actually exists. No
            provider is contracted yet, so in practice this is always the
            "not configured" line — driven by the backend's status, not by
            a hardcoded string here. */}
        {isSigned ? (
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-green-700">
            <ShieldCheck size={13} />
            Documento assinado digitalmente (ICP-Brasil).
          </p>
        ) : (
          <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-amber-700 italic">
            <Clock size={13} />
            Documento gerado eletronicamente — assinatura digital ainda não
            configurada.
          </p>
        )}
      </div>
    </div>
  );
}
