import { Skeleton } from "@/components/ui/Skeleton";

export default function RootLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Skeleton */}
      <div className="flex flex-col items-center text-center py-12 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-12 w-full max-w-xl rounded-xl" />
        <Skeleton className="h-5 w-3/4 max-w-md" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-11 w-36 rounded-full" />
          <Skeleton className="h-11 w-36 rounded-full" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-10 w-full rounded-xl mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
