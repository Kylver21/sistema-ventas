export function SkeletonKPI() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-8 w-8 bg-muted rounded-md" />
      </div>
      <div className="h-8 w-32 bg-muted rounded" />
      <div className="h-4 w-20 bg-muted rounded" />
    </div>
  )
}

export function SkeletonKPIGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonKPI key={i} />
      ))}
    </div>
  )
}
