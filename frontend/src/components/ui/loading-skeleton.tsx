interface LoadingSkeletonProps {
  type: 'grid' | 'list' | 'detail';
  count?: number;
}

export function LoadingSkeleton({ type, count = 1 }: LoadingSkeletonProps) {
  if (type === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
          >
            <div className="aspect-[3/4] bg-gray-200 skeleton" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 skeleton rounded w-3/4" />
              <div className="h-3 bg-gray-200 skeleton rounded w-1/2" />
              <div className="h-5 bg-gray-200 skeleton rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm p-4 flex gap-4 animate-pulse"
          >
            <div className="w-20 h-28 bg-gray-200 skeleton rounded" />
            <div className="flex-grow space-y-3">
              <div className="h-4 bg-gray-200 skeleton rounded w-3/4" />
              <div className="h-3 bg-gray-200 skeleton rounded w-1/2" />
              <div className="h-3 bg-gray-200 skeleton rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Detail skeleton
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="aspect-[3/4] bg-gray-200 skeleton rounded-lg" />
        </div>
        <div className="flex-grow space-y-4">
          <div className="h-8 bg-gray-200 skeleton rounded w-3/4" />
          <div className="h-4 bg-gray-200 skeleton rounded w-1/2" />
          <div className="h-10 bg-gray-200 skeleton rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 skeleton rounded" />
            <div className="h-3 bg-gray-200 skeleton rounded" />
            <div className="h-3 bg-gray-200 skeleton rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
