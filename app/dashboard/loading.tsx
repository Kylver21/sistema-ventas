import { SkeletonKPIGrid } from '@/components/skeletons/skeleton-kpi'
import { SkeletonTable } from '@/components/skeletons/skeleton-table'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="h-5 w-32 bg-muted rounded animate-pulse" />
      {/* KPIs */}
      <SkeletonKPIGrid />
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 animate-pulse">
          <div className="h-5 w-40 bg-muted rounded mb-4" />
          <div className="h-[300px] bg-muted rounded" />
        </div>
        <div className="bg-card border border-border rounded-lg p-6 animate-pulse space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-7 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
      {/* Table */}
      <SkeletonTable rows={5} cols={6} />
    </div>
  )
}
