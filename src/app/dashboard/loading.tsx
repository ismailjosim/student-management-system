'use client';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header */}
      <div>
        <div className="h-8 w-48 bg-muted rounded mb-2" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-background rounded-xl border p-4 space-y-3">
            <div className="h-9 w-9 bg-muted rounded-lg" />
            <div className="space-y-1">
              <div className="h-6 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-2 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="col-span-full lg:col-span-2 space-y-6">
          {/* Chart Skeleton */}
          <div className="bg-background rounded-xl border p-6 space-y-4">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-48 bg-muted rounded" />
          </div>

          {/* Table Skeleton */}
          <div className="bg-background rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="h-5 w-40 bg-muted rounded" />
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="col-span-full lg:col-span-1 space-y-6">
          {/* Call Queue Skeleton */}
          <div className="bg-background rounded-xl border flex flex-col h-full">
            <div className="px-6 py-4 border-b">
              <div className="h-5 w-32 bg-muted rounded mb-2" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
            <div className="flex-1 divide-y">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t">
              <div className="h-10 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
