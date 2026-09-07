import { Skeleton } from "@/components/ui/Skeleton";

export default function ResourcesLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Skeleton */}
      <div className="space-y-3 mb-8">
        <Skeleton className="h-9 w-60 rounded-lg" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 mb-8">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Main Content Area Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm space-y-6">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
