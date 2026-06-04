import { useState, useRef, useEffect } from "react";

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  loading?: boolean;
  onSearch?: (query: string) => void;
  allowFreeText?: boolean;
}

export function SearchableSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Pesquisar...",
  loading,
  onSearch,
  allowFreeText = true,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (allowFreeText && query.trim()) {
          onChange(query.trim());
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, allowFreeText, onChange]);

  const filtered = query.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  function handleInputChange(val: string) {
    setQuery(val);
    setOpen(true);
    if (onSearch) onSearch(val);
  }

  function handleFocus() {
    setOpen(true);
    // Trigger initial load if no options yet
    if (options.length === 0 && onSearch) {
      onSearch("");
    }
  }

  function handleSelect(opt: SearchableSelectOption) {
    setQuery(opt.label);
    onChange(opt.value);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        handleSelect(filtered[0]);
      } else if (allowFreeText && query.trim()) {
        onChange(query.trim());
        setOpen(false);
      }
    }
  }

  const showDropdown = open && (loading || filtered.length > 0 || (query.trim() !== "" && filtered.length === 0));

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label
        htmlFor={name}
        className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 focus:border-primary"
        />

        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {loading && (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                Buscando exames...
              </div>
            )}

            {!loading && filtered.length === 0 && query.trim() !== "" && (
              <div className="px-4 py-3 text-xs text-slate-500 text-center">
                {allowFreeText ? (
                  <span>
                    Nenhum resultado. Pressione <strong>Enter</strong> para usar "<strong>{query}</strong>"
                  </span>
                ) : (
                  "Nenhum resultado encontrado"
                )}
              </div>
            )}

            {!loading &&
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer border-none bg-transparent first:rounded-t-xl last:rounded-b-xl"
                >
                  {opt.label}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
