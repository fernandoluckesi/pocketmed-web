interface SegmentedToggleOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T extends string> {
  label?: string;
  options: SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** Two/three-option segmented control, same visual style as SearchWithViewToggle. */
export function SegmentedToggle<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: SegmentedToggleProps<T>) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border-none ${
              disabled ? "cursor-default" : "cursor-pointer"
            } ${
              value === opt.value
                ? "bg-primary text-white shadow-md"
                : "text-gray-400 hover:text-primary bg-transparent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
