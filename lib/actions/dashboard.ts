'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardMetrics() {
  const supabase = await createClient()

  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
  const mesAnteriorInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().split('T')[0]
  const mesAnteriorFin = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().split('T')[0]

  const [ventasMes, ventasMesAnterior, totalProductos, stockBajo] = await Promise.all([
    supabase
      .from('ventas')
      .select('total')
      .gte('fecha', inicioMes),
    supabase
      .from('ventas')
      .select('total')
      .gte('fecha', mesAnteriorInicio)
      .lte('fecha', mesAnteriorFin),
    supabase.from('productos').select('id', { count: 'exact', head: true }),
    supabase.from('productos').select('id', { count: 'exact', head: true }).lt('stock', 10),
  ])

  const ingresosMes = ventasMes.data?.reduce((s, v) => s + Number(v.total), 0) ?? 0
  const ingresosMesAnterior = ventasMesAnterior.data?.reduce((s, v) => s + Number(v.total), 0) ?? 0
  const cambioIngresos: number | null = ingresosMesAnterior === 0
    ? null
    : Math.round(((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100)

  const ordenesTotal = ventasMes.data?.length ?? 0
  const ordenesAnterior = ventasMesAnterior.data?.length ?? 0
  const cambioOrdenes: number | null = ordenesAnterior === 0
    ? null
    : Math.round(((ordenesTotal - ordenesAnterior) / ordenesAnterior) * 100)

  return {
    ingresos: `S/ ${ingresosMes.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
    ingresosChange: cambioIngresos,
    ordenes: ordenesTotal.toString(),
    ordenesChange: cambioOrdenes,
    productos: totalProductos.count ?? 0,
    stockBajo: stockBajo.count ?? 0,
  }
}

export async function getVentasMensuales() {
  const supabase = await createClient()
  const year = new Date().getFullYear()
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  const { data } = await supabase
    .from('ventas')
    .select('fecha, total')
    .gte('fecha', `${year}-01-01`)

  const porMes = meses.map((mes, i) => {
    const ventas = data?.filter(v => new Date(v.fecha).getMonth() === i) ?? []
    return {
      mes,
      ventas: ventas.reduce((s, v) => s + Number(v.total), 0),
    }
  })

  return porMes
}

type VentaRecienteRow = {
  id: number
  cliente_nombre: string | null
  fecha: string
  total: number
  venta_detalle: { productos: { nombre: string } | null }[]
}

export async function getVentasRecientes(limit = 5): Promise<VentaRecienteRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ventas')
    .select(`id, cliente_nombre, fecha, total, venta_detalle(cantidad, productos(nombre))`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as VentaRecienteRow[]
}
