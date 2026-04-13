export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
        <div className="h-4 w-10 bg-gray-100 rounded ml-auto" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-11/12 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-4/5 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
