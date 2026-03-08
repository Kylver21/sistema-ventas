'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardMetrics() {
  const supabase = await createClient()

  const hoy = new Date()
  const hoyStr = hoy.toISOString().split('T')[0]

  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)
  const ayerStr = ayer.toISOString().split('T')[0]

  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
  const mesAnteriorInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().split('T')[0]
  const mesAnteriorFin = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().split('T')[0]

  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - 6)
  const inicioSemanaStr = inicioSemana.toISOString().split('T')[0]

  const inicioSemanaAnterior = new Date(hoy)
  inicioSemanaAnterior.setDate(hoy.getDate() - 13)
  const inicioSemanaAnteriorStr = inicioSemanaAnterior.toISOString().split('T')[0]
  const finSemanaAnterior = new Date(hoy)
  finSemanaAnterior.setDate(hoy.getDate() - 7)
  const finSemanaAnteriorStr = finSemanaAnterior.toISOString().split('T')[0]

  const [
    ventasMes, ventasMesAnterior,
    ventasHoy, ventasAyer,
    ventasSemana, ventasSemanaAnterior,
    totalProductos, stockBajo, sinStockQuery,
  ] = await Promise.all([
    supabase.from('ventas').select('total').gte('fecha', inicioMes),
    supabase.from('ventas').select('total').gte('fecha', mesAnteriorInicio).lte('fecha', mesAnteriorFin),
    supabase.from('ventas').select('total').eq('fecha', hoyStr),
    supabase.from('ventas').select('total').eq('fecha', ayerStr),
    supabase.from('ventas').select('total').gte('fecha', inicioSemanaStr).lte('fecha', hoyStr),
    supabase.from('ventas').select('total').gte('fecha', inicioSemanaAnteriorStr).lte('fecha', finSemanaAnteriorStr),
    supabase.from('productos').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('productos').select('id', { count: 'exact', head: true }).eq('activo', true).gt('stock', 0).lt('stock', 10),
    supabase.from('productos').select('id', { count: 'exact', head: true }).eq('activo', true).eq('stock', 0),
  ])

  // Monthly
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

  // Daily
  const ingresosHoy = ventasHoy.data?.reduce((s, v) => s + Number(v.total), 0) ?? 0
  const ingresosAyer = ventasAyer.data?.reduce((s, v) => s + Number(v.total), 0) ?? 0
  const cambioIngresosDay: number | null = ingresosAyer === 0
    ? null
    : Math.round(((ingresosHoy - ingresosAyer) / ingresosAyer) * 100)
  const ordenesHoy = ventasHoy.data?.length ?? 0
  const ordenesAyer = ventasAyer.data?.length ?? 0
  const cambioOrdenesDay: number | null = ordenesAyer === 0
    ? null
    : Math.round(((ordenesHoy - ordenesAyer) / ordenesAyer) * 100)

  // Weekly
  const ingresosSemana = ventasSemana.data?.reduce((s, v) => s + Number(v.total), 0) ?? 0
  const ingresosSemanaAnterior = ventasSemanaAnterior.data?.reduce((s, v) => s + Number(v.total), 0) ?? 0
  const cambioIngresosWeek: number | null = ingresosSemanaAnterior === 0
    ? null
    : Math.round(((ingresosSemana - ingresosSemanaAnterior) / ingresosSemanaAnterior) * 100)
  const ordenesSemana = ventasSemana.data?.length ?? 0
  const ordenesSemanaAnterior = ventasSemanaAnterior.data?.length ?? 0
  const cambioOrdenesWeek: number | null = ordenesSemanaAnterior === 0
    ? null
    : Math.round(((ordenesSemana - ordenesSemanaAnterior) / ordenesSemanaAnterior) * 100)

  const ticketPromedio = ordenesTotal === 0
    ? null
    : `S/ ${(ingresosMes / ordenesTotal).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

  return {
    ingresos: `S/ ${ingresosMes.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
    ingresosChange: cambioIngresos,
    ingresosChangeDay: cambioIngresosDay,
    ingresosChangeWeek: cambioIngresosWeek,
    ordenes: ordenesTotal.toString(),
    ordenesChange: cambioOrdenes,
    ordenesChangeDay: cambioOrdenesDay,
    ordenesChangeWeek: cambioOrdenesWeek,
    productos: totalProductos.count ?? 0,
    stockBajo: stockBajo.count ?? 0,
    sinStock: sinStockQuery.count ?? 0,
    ticketPromedio,
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

  const mesesFull = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  const porMes = meses.map((mes, i) => {
    const ventas = data?.filter(v => new Date(v.fecha).getMonth() === i) ?? []
    return {
      mes,
      ventas: ventas.reduce((s, v) => s + Number(v.total), 0),
      fechaCompleta: `${mesesFull[i]} ${year}`,
    }
  })

  return porMes
}

export async function getVentasDiarias() {
  const supabase = await createClient()
  const now = new Date()

  const hours = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now)
    d.setMinutes(0, 0, 0)
    d.setHours(d.getHours() - (23 - i))
    return {
      hora: `${d.getHours().toString().padStart(2, '0')}:00`,
      ventas: 0,
      fechaCompleta: d.toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      _date: d.toISOString().split('T')[0],
      _hour: d.getHours(),
    }
  })

  const since = new Date(now)
  since.setHours(since.getHours() - 23, 0, 0, 0)

  const { data } = await supabase
    .from('ventas')
    .select('created_at, total')
    .gte('created_at', since.toISOString())

  for (const row of data ?? []) {
    const createdAt = new Date(row.created_at)
    const bucket = hours.find(
      h => h._date === createdAt.toISOString().split('T')[0] && h._hour === createdAt.getHours(),
    )
    if (bucket) bucket.ventas += Number(row.total)
  }

  return hours.map(({ _date: _d, _hour: _h, ...rest }) => rest)
}

export async function getVentasSemanales() {
  const supabase = await createClient()
  const now = new Date()

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const fecha = d.toISOString().split('T')[0]
    return {
      dia: d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' }),
      ventas: 0,
      fechaCompleta: d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      _fecha: fecha,
    }
  })

  const { data } = await supabase
    .from('ventas')
    .select('fecha, total')
    .gte('fecha', dias[0]._fecha)

  for (const row of data ?? []) {
    const dia = dias.find(d => d._fecha === row.fecha)
    if (dia) dia.ventas += Number(row.total)
  }

  return dias.map(({ _fecha: _, ...rest }) => rest)
}

export async function getTopProductosMasVendidos(limit = 5) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('venta_detalle')
    .select('producto_id, cantidad, subtotal, productos(nombre, categorias(nombre))')

  if (error || !data) return []

  const map = new Map<number, { nombre: string; categoria: string; total_vendido: number; ingresos: number }>()
  for (const row of data) {
    const pid = row.producto_id
    if (!pid) continue
    const prod = row.productos as { nombre: string; categorias: { nombre: string } | null } | null
    const existing = map.get(pid) ?? {
      nombre: prod?.nombre ?? 'Desconocido',
      categoria: prod?.categorias?.nombre ?? '',
      total_vendido: 0,
      ingresos: 0,
    }
    existing.total_vendido += (row as { cantidad: number }).cantidad
    existing.ingresos += Number((row as { subtotal: number }).subtotal)
    map.set(pid, existing)
  }

  return [...map.values()]
    .sort((a, b) => b.total_vendido - a.total_vendido)
    .slice(0, limit)
}

export async function getProductosStockCritico(limit = 7) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('productos')
    .select('id, nombre, stock, categorias(nombre)')
    .eq('activo', true)
    .lt('stock', 10)
    .order('stock', { ascending: true })
    .limit(limit)
  return (data ?? []) as { id: number; nombre: string; stock: number; categorias: { nombre: string } | null }[]
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
