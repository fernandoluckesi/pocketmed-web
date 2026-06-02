interface SkeletonProps {
  variant?: "card" | "row" | "text" | "table";
  count?: number;
  className?: string;
}

function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-pulse">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
          <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
        </div>
      </div>
      <div className="space-y-3 mb-5">
        <div className="h-4 bg-gray-100 rounded-lg w-full" />
        <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
      </div>
      <div className="pt-4 border-t border-gray-100">
        <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 animate-pulse flex items-center gap-5">
      <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded-lg w-1/3" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
      </div>
      <div className="hidden md:flex items-center gap-8 flex-1">
        <div className="h-4 bg-gray-100 rounded-lg w-32" />
        <div className="h-4 bg-gray-100 rounded-lg w-28" />
      </div>
      <div className="h-10 bg-gray-100 rounded-xl w-32" />
    </div>
  );
}

function SkeletonText() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded-lg w-full" />
      <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
      <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
      <div className="p-6 border-b border-slate-100 flex justify-between">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded-lg w-48" />
          <div className="h-3 bg-gray-100 rounded-lg w-64" />
        </div>
        <div className="h-10 bg-gray-200 rounded-full w-40" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="px-6 py-5 flex items-center gap-6 border-b border-slate-50"
        >
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-gray-200" />
            <div className="h-4 bg-gray-100 rounded w-32" />
          </div>
          <div className="h-6 bg-gray-100 rounded-full w-20" />
          <div className="h-8 bg-gray-100 rounded w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function Skeleton({
  variant = "card",
  count = 1,
  className = "",
}: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === "table") {
    return (
      <div className={className}>
        {items.map((i) => (
          <SkeletonTable key={i} />
        ))}
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={className}>
        {items.map((i) => (
          <SkeletonText key={i} />
        ))}
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}
    >
      {items.map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
