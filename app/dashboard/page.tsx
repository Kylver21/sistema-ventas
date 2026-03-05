import { getDashboardMetrics, getVentasMensuales, getVentasRecientes } from '@/lib/actions/dashboard'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const [metrics, ventasMensuales, ventasRecientes] = await Promise.all([
    getDashboardMetrics(),
    getVentasMensuales(),
    getVentasRecientes(8),
  ])
  return <DashboardClient metrics={metrics} ventasMensuales={ventasMensuales} ventasRecientes={ventasRecientes} />
}
