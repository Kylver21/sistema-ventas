export default function ProductosLoading() {
  return (
    <div className="space-y-6">
      <div className="h-5 w-32 bg-muted rounded animate-pulse" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="h-10 bg-muted rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-muted rounded" />
                <div className="h-8 w-8 bg-muted rounded" />
              </div>
            </div>
            <div className="h-8 w-24 bg-muted rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="h-3 w-12 bg-muted rounded" />
                <div className="h-6 w-10 bg-muted rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-14 bg-muted rounded" />
                <div className="h-6 w-14 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
