interface SkeletonTableProps {
  rows?: number
  cols?: number
}

export function SkeletonTable({ rows = 5, cols = 6 }: SkeletonTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-muted/50">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 bg-muted rounded" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-4 flex-1 bg-muted rounded"
              style={{ opacity: 1 - j * 0.05 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
