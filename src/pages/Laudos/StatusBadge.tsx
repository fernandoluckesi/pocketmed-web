import {
  REPORT_STATUS_LABELS,
  type DocumentStatus,
} from "../../services/reports";

const STATUS_CLASSES: Record<DocumentStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  generated: "bg-blue-100 text-primary",
  sent: "bg-amber-100 text-amber-700",
  signed: "bg-green-100 text-green-700",
  canceled: "bg-red-100 text-red-700",
};

/**
 * `signed` is only reachable once a real signature provider sets it — the
 * current mock provider never does — so this badge can't present a document
 * as digitally signed before that's actually true.
 */
export function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
        STATUS_CLASSES[status] || STATUS_CLASSES.draft
      }`}
    >
      {REPORT_STATUS_LABELS[status] || status}
    </span>
  );
}
