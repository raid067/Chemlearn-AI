import { Skeleton } from "@/components/ui/Skeleton";

export default function ExperimentsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Skeleton */}
      <div className="space-y-3 mb-8">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Virtual Lab Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col gap-4"
          >
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-7 w-3/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-11 w-full rounded-xl mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
