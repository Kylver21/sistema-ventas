import {
  getDashboardMetrics, getVentasMensuales, getVentasDiarias, getVentasSemanales,
  getVentasRecientes, getTopProductosMasVendidos, getProductosStockCritico,
} from '@/lib/actions/dashboard'
import { getCurrentProfile } from '@/lib/actions/auth'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const [metrics, ventasMensuales, ventasDiarias, ventasSemanales, ventasRecientes, topProductos, stockCritico, perfil] = await Promise.all([
    getDashboardMetrics(),
    getVentasMensuales(),
    getVentasDiarias(),
    getVentasSemanales(),
    getVentasRecientes(8),
    getTopProductosMasVendidos(5),
    getProductosStockCritico(7),
    getCurrentProfile(),
  ])
  return (
    <DashboardClient
      metrics={metrics}
      ventasMensuales={ventasMensuales}
      ventasDiarias={ventasDiarias}
      ventasSemanales={ventasSemanales}
      ventasRecientes={ventasRecientes}
      topProductos={topProductos}
      stockCritico={stockCritico}
      nombreUsuario={(perfil as { nombre?: string | null } | null)?.nombre ?? null}
    />
  )
}
