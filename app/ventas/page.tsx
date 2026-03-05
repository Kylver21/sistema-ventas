import { getVentas } from '@/lib/actions/ventas'
import { getProductosActivos } from '@/lib/actions/productos'
import { VentasClient } from './ventas-client'

export default async function VentasPage() {
  const [ventas, productos] = await Promise.all([getVentas(), getProductosActivos()])
  return <VentasClient initialVentas={ventas} productos={productos} />
}
