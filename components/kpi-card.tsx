import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  change: number
  icon: LucideIcon
}

export function KPICard({ title, value, change, icon: Icon }: KPICardProps) {
  const isPositive = change >= 0

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-primary/10 rounded-md">
          <Icon size={20} className="text-primary" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{change}% vs mes anterior
        </p>
      </div>
    </div>
  )
}
