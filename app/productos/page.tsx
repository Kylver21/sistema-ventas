import { getProductos, getVentasEstadisticasProductos } from '@/lib/actions/productos'
import { getCategorias } from '@/lib/actions/categorias'
import { ProductosClient } from './productos-client'

export default async function ProductosPage() {
  const [productos, categorias, statsVentas] = await Promise.all([
    getProductos(),
    getCategorias(),
    getVentasEstadisticasProductos(),
  ])
  return (
    <ProductosClient
      initialProductos={productos}
      categorias={categorias}
      statsVentas={statsVentas}
    />
  )
}
