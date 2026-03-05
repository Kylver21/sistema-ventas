'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Categoria } from '@/lib/supabase/types'

export async function getCategorias(): Promise<Categoria[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre')

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Categoria[]
}

export async function getCategoriasConConteo() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('*, productos(count)')
    .order('nombre')

  if (error) throw new Error(error.message)

  type CatRow = { id: number; nombre: string; descripcion: string | null; productos: { count: number }[] }

  return ((data ?? []) as unknown as CatRow[]).map((cat) => ({
    id: cat.id,
    nombre: cat.nombre,
    descripcion: cat.descripcion,
    total_productos: cat.productos?.[0]?.count ?? 0,
  }))
}

export async function createCategoria(input: {
  nombre: string
  descripcion?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('categorias').insert(input)
  if (error) throw new Error(error.message)
  revalidatePath('/categorias')
  return { success: true }
}

export async function updateCategoria(
  id: number,
  input: { nombre?: string; descripcion?: string }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('categorias').update(input).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/categorias')
}

export async function deleteCategoria(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/categorias')
}
