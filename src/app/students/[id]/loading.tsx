import { SkeletonCard, SkeletonTable } from '@/components/Common/SkeletonLoader';

const SingleStudentLoading = () => {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-32 bg-muted rounded animate-pulse" />

      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      </div>

      {/* Main Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <SkeletonCard count={1} />
          <SkeletonTable rows={5} columns={2} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard count={1} />
          {/* 3-Column Side-by-Side Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard count={1} />
            <SkeletonCard count={1} />
            <SkeletonCard count={1} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleStudentLoading;
