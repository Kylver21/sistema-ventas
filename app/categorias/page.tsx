import { getCategoriasConConteo } from '@/lib/actions/categorias'
import { CategoriasClient } from './categorias-client'

export default async function CategoriasPage() {
  const categorias = await getCategoriasConConteo()
  return <CategoriasClient initialCategorias={categorias} />
}
