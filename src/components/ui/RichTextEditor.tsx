import { useEffect } from "react";
import {
  EditorContent,
  useEditor,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Pilcrow,
  Minus,
} from "lucide-react";
import type { RichTextDoc } from "../../services/reports";

/**
 * Rich-text editor for medical prose (laudos). Emits Tiptap's native
 * ProseMirror JSON — the same shape the backend's
 * `rendering/prosemirror-to-pdfkit.ts` walks when drawing the PDF. The
 * structured JSON is the source of truth; the PDF is a rendering of it,
 * which is what makes a saved laudo editable later.
 *
 * The toolbar is deliberately limited to what the PDF renderer actually
 * supports (bold/italic, headings, bullet & ordered lists, paragraphs,
 * section breaks) — offering a mark the PDF would silently drop would mean
 * the document on screen and the document in the PDF disagree.
 */

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={!!active}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer border-none ${
        active
          ? "bg-primary/10 text-primary"
          : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50/70 rounded-t-xl flex-wrap">
      <ToolbarButton
        label="Negrito"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Itálico"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon className="w-3.5 h-3.5" />
      </ToolbarButton>

      <span className="w-px h-5 bg-slate-200 mx-1" />

      <ToolbarButton
        label="Parágrafo"
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Título"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Subtítulo"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="w-3.5 h-3.5" />
      </ToolbarButton>

      <span className="w-px h-5 bg-slate-200 mx-1" />

      <ToolbarButton
        label="Lista"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Lista numerada"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </ToolbarButton>

      <span className="w-px h-5 bg-slate-200 mx-1" />

      <ToolbarButton
        label="Quebra de seção"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="w-3.5 h-3.5" />
      </ToolbarButton>
    </div>
  );
}

interface RichTextEditorProps {
  label: string;
  value: RichTextDoc | null;
  onChange: (value: RichTextDoc | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: RichTextEditorProps) {
  const editor = useEditor({
    // StarterKit minus the nodes/marks the PDF renderer doesn't draw, so the
    // editor can't produce content the PDF would drop.
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
        strike: false,
        code: false,
        codeBlock: false,
      }),
    ],
    content: (value as JSONContent | null) ?? "",
    editable: !disabled,
    onUpdate: ({ editor: instance }) => {
      // An "empty" document still serializes to a one-empty-paragraph doc —
      // send null instead so the backend leaves the column NULL and the
      // section is omitted from the PDF entirely.
      onChange(instance.isEmpty ? null : (instance.getJSON() as RichTextDoc));
    },
    editorProps: {
      attributes: {
        class:
          "prose-sm max-w-none min-h-[120px] px-4 py-3 text-sm text-slate-800 outline-none [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_hr]:my-3 [&_hr]:border-slate-200 [&_p]:mb-2",
        "aria-label": label,
      },
    },
  });

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return null;

  return (
    <div className="space-y-1.5">
      <p className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <div
        className={`bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all ${
          disabled ? "opacity-60" : ""
        }`}
      >
        {!disabled && <Toolbar editor={editor} />}
        <div className="relative">
          <EditorContent editor={editor} />
          {editor.isEmpty && placeholder && (
            <p className="absolute inset-x-0 top-3 px-4 text-sm text-slate-400 pointer-events-none">
              {placeholder}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
