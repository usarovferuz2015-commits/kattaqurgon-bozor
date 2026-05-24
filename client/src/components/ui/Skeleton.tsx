export function ProductCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton w-3/4" />
        <div className="h-4 skeleton w-1/2" />
        <div className="h-3 skeleton w-1/3" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-full skeleton" />
      <div className="h-3 skeleton w-16" />
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="h-44 rounded-2xl skeleton" />
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
