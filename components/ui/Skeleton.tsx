/** Skeleton loading placeholder */
export function SkeletonBox({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-[12px] bg-bg-card ${className}`}
    />
  );
}

/** Skeleton for a full treemap module page */
export function ModuleSkeleton() {
  return (
    <div className="mx-auto max-w-container px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3.5">
        <SkeletonBox className="h-14 w-14" />
        <div>
          <SkeletonBox className="mb-2 h-7 w-48" />
          <SkeletonBox className="h-4 w-32" />
        </div>
      </div>

      {/* Variable selector */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBox key={i} className="h-24" />
        ))}
      </div>

      {/* Segment filter */}
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBox key={i} className="h-8 w-16" />
        ))}
      </div>

      {/* Metrics */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox key={i} className="h-20" />
        ))}
      </div>

      {/* Chart area */}
      <SkeletonBox className="mb-4 h-[400px] lg:h-[650px]" />

      {/* Table */}
      <SkeletonBox className="h-96" />
    </div>
  );
}
