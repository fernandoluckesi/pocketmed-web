import { Search, LayoutGrid, List } from "lucide-react";

interface SearchWithViewToggleProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
}

export function SearchWithViewToggle({
  placeholder = "Buscar...",
  value,
  onChange,
  view,
  onViewChange,
}: SearchWithViewToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 focus:border-primary"
        />
      </div>
      <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
        <button
          onClick={() => onViewChange("grid")}
          className={`p-2 rounded-lg transition-all cursor-pointer border-none ${view === "grid" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-primary bg-transparent"}`}
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewChange("list")}
          className={`p-2 rounded-lg transition-all cursor-pointer border-none ${view === "list" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-primary bg-transparent"}`}
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
