import { SkeletonTable } from '@/components/skeletons/skeleton-table'

export default function VentasLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb + header skeletons */}
      <div className="h-5 w-32 bg-muted rounded animate-pulse" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
      </div>
      {/* Filter bar */}
      <div className="flex gap-4">
        <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
        <div className="w-36 h-10 bg-muted rounded-lg animate-pulse" />
        <div className="w-28 h-10 bg-muted rounded-lg animate-pulse" />
      </div>
      {/* Table */}
      <SkeletonTable rows={5} cols={7} />
      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
