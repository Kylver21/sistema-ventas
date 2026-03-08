'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Producto } from '@/lib/supabase/types'

// Interface para tipado mas seguro
interface ProductoInput {
  nombre: string
  categoria_id: number
  precio: number // Precio de venta
  precio_compra?: number // Para calcular margen de ganancia
  stock: number
  codigo_barras?: string // Crucial para el sistema de ventas
  activo?: boolean // Visible/disponible en el sistema
}

export async function getProductos(): Promise<Producto[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categorias (id, nombre)
    `)
    .eq('activo', true)
    .order('nombre')

  if (error) {
    console.error('Error al obtener productos:', error.message)
    throw new Error('No se pudieron cargar los productos')
  }
  return (data ?? []) as unknown as Producto[]
}

export async function getProductosActivos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, precio, stock, codigo_barras, categoria_id, categorias(nombre)')
    .eq('activo', true)
    .gt('stock', 0)
    .order('nombre')

  if (error) throw new Error(error.message)
  return (data ?? []) as {
    id: number
    nombre: string
    precio: number
    stock: number
    codigo_barras: string | null
    categoria_id: number | null
    categorias: { nombre: string } | null
  }[]
}

// Funcion especifica para buscar por codigo de barras (muy usada en ventas rapidas)
export async function getProductoByCodigo(codigo: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('codigo_barras', codigo)
    .single()

  if (error) return null
  return data
}

export async function createProducto(input: ProductoInput) {
  const supabase = await createClient()
  const { error } = await supabase.from('productos').insert(input)

  if (error) {
    if (error.code === '23505') throw new Error('El codigo de barras ya existe')
    throw new Error(error.message)
  }

  revalidatePath('/productos')
  return { success: true }
}

export async function updateProducto(
  id: number,
  input: Partial<ProductoInput>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('productos').update(input).eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/productos')
  return { success: true }
}

export async function deleteProducto(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('productos').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/productos')
  return { success: true }
}
