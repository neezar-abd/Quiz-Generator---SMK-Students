export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header skeleton */}
      <div className="h-8 bg-black/10 rounded w-3/4"></div>
      
      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-black/10 rounded"></div>
        <div className="h-4 bg-black/10 rounded w-5/6"></div>
        <div className="h-4 bg-black/10 rounded w-4/6"></div>
      </div>
      
      {/* List skeleton */}
      <div className="space-y-4 mt-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-black/10 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-black/10 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-black/10 rounded w-1/2"></div>
                <div className="h-3 bg-black/10 rounded w-1/3"></div>
              </div>
              <div className="h-8 w-16 bg-black/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}