import { Skeleton } from '@/components/Common/SkeletonLoader';

export function DashboardSkeleton() {
  return (
    <div
      className="space-y-8 animate-in fade-in duration-300"
      aria-busy="true"
      aria-label="Loading dashboard data"
    >
      <div className="page-header rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm sm:p-7">
        <div className="w-full max-w-xl space-y-3">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-10 w-64 max-w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="surface flex min-h-40 flex-col justify-between p-5">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="surface overflow-hidden">
        <div className="space-y-2 border-b border-border/70 px-6 py-5">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-xl border p-4">
              <Skeleton className="mx-auto h-3 w-10" />
              <Skeleton className="mx-auto h-8 w-12" />
              <Skeleton className="mx-auto h-3 w-14" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="surface overflow-hidden">
            <div className="space-y-2 border-b px-6 py-5">
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
            <div className="p-6">
              <div className="flex h-72 items-end gap-3 rounded-xl border border-border/60 bg-muted/20 p-5">
                {[42, 68, 54, 82, 62, 74, 48, 66, 36, 58].map((height, index) => (
                  <Skeleton
                    key={index}
                    className="flex-1 rounded-t-lg rounded-b-sm"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-10 w-48 rounded-xl" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="surface overflow-hidden">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="divide-y divide-border">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48 max-w-full" />
                    </div>
                    <Skeleton className="hidden h-4 w-14 sm:block" />
                    <Skeleton className="hidden h-6 w-16 rounded-full sm:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="surface flex min-h-[620px] flex-col overflow-hidden">
          <div className="space-y-2 border-b px-6 py-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex-1 divide-y divide-border">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-5 py-4">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t p-5">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="mx-auto h-3 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
