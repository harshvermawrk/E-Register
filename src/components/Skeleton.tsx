import type { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

/** Base shimmering placeholder block. Compose these to build skeleton layouts. */
export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer rounded-md ${className}`}
      style={{ backgroundColor: "#E2E8F0", ...style }}
      aria-hidden="true"
    />
  );
}

export function KPICardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" role="status" aria-label="Loading overview cards">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[12px] p-6 flex flex-col gap-4"
          style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
      <span className="sr-only">Loading overview cards…</span>
    </div>
  );
}

export function MemberManagementSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-5" role="status" aria-label="Loading members">
      <div className="rounded-[12px] p-4 space-y-3 w-full lg:w-1/4" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      <div className="rounded-[12px] p-4 space-y-3 flex-1" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="rounded-[12px] p-5 space-y-4 w-full lg:w-[30%]" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      <span className="sr-only">Loading member data…</span>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading analytics">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-[12px] p-5" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-56 w-full" />
        </div>
        <div className="rounded-[12px] p-5" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-40 w-40 rounded-full mx-auto" />
        </div>
      </div>
      <div className="rounded-[12px] p-5" style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0" }}>
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
      <span className="sr-only">Loading analytics…</span>
    </div>
  );
}
