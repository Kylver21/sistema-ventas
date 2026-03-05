import { getProductos } from '@/lib/actions/productos'
import { getCategorias } from '@/lib/actions/categorias'
import { ProductosClient } from './productos-client'

export default async function ProductosPage() {
  const [productos, categorias] = await Promise.all([getProductos(), getCategorias()])
  return <ProductosClient initialProductos={productos} categorias={categorias} />
}
