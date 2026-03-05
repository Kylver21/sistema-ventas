'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Venta } from '@/lib/supabase/types'

export async function getVentas(): Promise<Venta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ventas')
    .select(`
      *,
      venta_detalle (
        id, cantidad, precio_unitario, subtotal,
        productos (nombre)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Venta[]
}

export interface VentaItem {
  producto_id: number
  cantidad: number
}

export async function createVenta(input: {
  cliente_nombre?: string
  items: VentaItem[]
}) {
  if (!input.items.length) throw new Error('Debes agregar al menos un producto')

  const supabase = await createClient()

  // Verificar stock y obtener precios de todos los productos
  const productIds = input.items.map(i => i.producto_id)
  const { data: productos, error: prodError } = await supabase
    .from('productos')
    .select('id, precio, stock')
    .in('id', productIds)
    .eq('activo', true)

  if (prodError || !productos) throw new Error('Error al obtener productos')

  // Validar stock por item
  for (const item of input.items) {
    const prod = productos.find(p => p.id === item.producto_id)
    if (!prod) throw new Error(`Producto ${item.producto_id} no encontrado`)
    if (prod.stock < item.cantidad) {
      throw new Error(`Stock insuficiente para el producto #${item.producto_id}`)
    }
  }

  // Calcular total
  const total = input.items.reduce((sum, item) => {
    const prod = productos.find(p => p.id === item.producto_id)!
    return sum + prod.precio * item.cantidad
  }, 0)

  // Insertar cabecera de venta
  const { data: venta, error: ventaError } = await supabase
    .from('ventas')
    .insert({
      cliente_nombre: input.cliente_nombre || null,
      total,
      fecha: new Date().toISOString().split('T')[0],
    })
    .select('id')
    .single()

  if (ventaError || !venta) throw new Error('Error al crear la venta')

  // Insertar líneas de detalle
  const detalles = input.items.map(item => ({
    venta_id: venta.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_unitario: productos.find(p => p.id === item.producto_id)!.precio,
  }))

  const { error: detalleError } = await supabase
    .from('venta_detalle')
    .insert(detalles)

  if (detalleError) throw new Error('Error al guardar el detalle de la venta')

  // Descontar stock
  for (const item of input.items) {
    const prod = productos.find(p => p.id === item.producto_id)!
    await supabase
      .from('productos')
      .update({ stock: prod.stock - item.cantidad })
      .eq('id', item.producto_id)
  }

  revalidatePath('/ventas')
  revalidatePath('/dashboard')
  return { success: true, id: venta.id }
}

export async function deleteVenta(id: number) {
  const supabase = await createClient()
  // ON DELETE CASCADE elimina venta_detalle automáticamente
  const { error } = await supabase.from('ventas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/ventas')
}

