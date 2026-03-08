'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DollarSign, ShoppingCart, Package, AlertTriangle,
  TrendingUp, TrendingDown, Plus, Receipt, ArrowRight,
  Flame, PackageX, BarChart3, Clock, CalendarDays, Calendar,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, TooltipProps,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

type Periodo = 'diario' | 'semanal' | 'mensual'

interface Metrics {
  ingresos: string
  ingresosChange: number | null
  ingresosChangeDay: number | null
  ingresosChangeWeek: number | null
  ordenes: string
  ordenesChange: number | null
  ordenesChangeDay: number | null
  ordenesChangeWeek: number | null
  productos: number
  stockBajo: number
  sinStock: number
  ticketPromedio: string | null
}

interface VentaMensual {
  mes: string
  ventas: number
  fechaCompleta: string
}

interface VentaDiaria {
  hora: string
  ventas: number
  fechaCompleta: string
}

interface VentaSemanal {
  dia: string
  ventas: number
  fechaCompleta: string
}

interface VentaReciente {
  id: number
  cliente_nombre: string | null
  fecha: string
  total: number
  venta_detalle: { productos: { nombre: string } | null }[]
}

interface TopProducto {
  nombre: string
  categoria: string
  total_vendido: number
  ingresos: number
}

interface ProductoAlerta {
  id: number
  nombre: string
  stock: number
  categorias: { nombre: string } | null
}

interface Props {
  metrics: Metrics
  ventasMensuales: VentaMensual[]
  ventasDiarias: VentaDiaria[]
  ventasSemanales: VentaSemanal[]
  ventasRecientes: VentaReciente[]
  topProductos: TopProducto[]
  stockCritico: ProductoAlerta[]
  nombreUsuario: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFecha(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00')
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

function getInitials(name: string | null): string {
  if (!name) return 'CF'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// ─── CustomTooltip ────────────────────────────────────────────────────────────────

function GraficoTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const pt = payload[0]
  const data = pt.payload as { fechaCompleta?: string }
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2.5 shadow-lg">
      {data.fechaCompleta && (
        <p className="text-[11px] text-muted-foreground font-medium mb-1">{data.fechaCompleta}</p>
      )}
      <p className="text-sm font-bold text-foreground">
        S/ {(pt.value ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

type AccentColor = 'primary' | 'blue' | 'purple' | 'green' | 'orange' | 'red'

const accentMap: Record<AccentColor, { icon: string; valueAlert: string }> = {
  primary: { icon: 'bg-primary/10 text-primary',                                                     valueAlert: 'text-foreground' },
  blue:    { icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',               valueAlert: 'text-foreground' },
  purple:  { icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',       valueAlert: 'text-foreground' },
  green:   { icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',           valueAlert: 'text-foreground' },
  orange:  { icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',       valueAlert: 'text-orange-600 dark:text-orange-400' },
  red:     { icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',                   valueAlert: 'text-red-600 dark:text-red-400' },
}

function StatCard({
  title, value, subtitle, change, changeLabel = 'vs mes ant.', icon: Icon, accent = 'primary', href, pulse,
}: {
  title: string
  value: string | number
  subtitle?: string
  change?: number | null
  changeLabel?: string
  icon: React.ElementType
  accent?: AccentColor
  href?: string
  pulse?: boolean
}) {
  const colors = accentMap[accent]
  const showAlert = pulse && Number(value) > 0

  const inner = (
    <div className={`bg-card border border-border rounded-xl p-4 flex flex-col gap-3 h-full ${href ? 'hover:shadow-md hover:border-primary/20 transition-all cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">{title}</p>
        <div className={`p-1.5 rounded-lg shrink-0 ${colors.icon}`}>
          <Icon size={13} />
        </div>
      </div>
      <div>
        <div className="flex items-end gap-1.5">
          <p className={`text-2xl font-bold leading-none ${showAlert ? colors.valueAlert : 'text-foreground'}`}>
            {value}
          </p>
          {showAlert && (
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mb-0.5 shrink-0" />
          )}
        </div>
        {change !== null && change !== undefined ? (
          <div className={`flex items-center gap-0.5 mt-1.5 text-[11px] font-medium ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
            {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            <span>{change >= 0 ? '+' : ''}{change}% {changeLabel}</span>
          </div>
        ) : subtitle ? (
          <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )

  if (href) return <Link href={href} className="block h-full">{inner}</Link>
  return inner
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DashboardClient({
  metrics, ventasMensuales, ventasDiarias, ventasSemanales,
  ventasRecientes, topProductos, stockCritico, nombreUsuario,
}: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('mensual')

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'
  const year = new Date().getFullYear()
  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const maxVendido = topProductos[0]?.total_vendido ?? 1

  // Derived chart data and labels based on period
  const chartConfig: {
    data: (VentaDiaria | VentaSemanal | VentaMensual)[]
    xKey: string
    title: string
    subtitle: string
  } = periodo === 'diario'
    ? { data: ventasDiarias, xKey: 'hora', title: 'Ventas — Últimas 24h', subtitle: 'Ingresos por hora' }
    : periodo === 'semanal'
    ? { data: ventasSemanales, xKey: 'dia', title: 'Ventas — Esta semana', subtitle: 'Ingresos por día (últimos 7 días)' }
    : { data: ventasMensuales, xKey: 'mes', title: `Ventas ${year}`, subtitle: 'Ingresos acumulados por mes' }

  // Dynamic change values & labels for KPIs based on selected period
  const kpiIngresosChange = periodo === 'diario'
    ? metrics.ingresosChangeDay
    : periodo === 'semanal'
    ? metrics.ingresosChangeWeek
    : metrics.ingresosChange

  const kpiOrdenesChange = periodo === 'diario'
    ? metrics.ordenesChangeDay
    : periodo === 'semanal'
    ? metrics.ordenesChangeWeek
    : metrics.ordenesChange

  const kpiChangeLabel = periodo === 'diario' ? 'vs ayer' : periodo === 'semanal' ? 'vs sem. ant.' : 'vs mes ant.'

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 suppressHydrationWarning className="text-3xl font-bold text-foreground">
            {saludo}{nombreUsuario ? `, ${nombreUsuario.split(' ')[0]}` : ''} 👋
          </h1>
          <p suppressHydrationWarning className="text-muted-foreground text-sm mt-0.5 capitalize">
            {fechaHoy}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/ventas"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Receipt size={14} /> Nueva venta
          </Link>
          <Link
            href="/productos"
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <Plus size={14} /> Producto
          </Link>
        </div>
      </div>

      {/* ── 6 KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Ingresos del mes"
          value={metrics.ingresos}
          change={kpiIngresosChange}
          changeLabel={kpiChangeLabel}
          icon={DollarSign}
          accent="blue"
        />
        <StatCard
          title="Órdenes del mes"
          value={metrics.ordenes}
          change={kpiOrdenesChange}
          changeLabel={kpiChangeLabel}
          icon={ShoppingCart}
          accent="purple"
        />
        <StatCard
          title="Ticket promedio"
          value={metrics.ticketPromedio ?? '—'}
          subtitle="por orden"
          icon={Receipt}
          accent="green"
        />
        <StatCard
          title="Total productos"
          value={metrics.productos}
          icon={Package}
          accent="primary"
        />
        <StatCard
          title="Stock bajo"
          value={metrics.stockBajo}
          subtitle="< 10 unidades"
          icon={AlertTriangle}
          accent="orange"
          href="/pedidos-sugeridos"
          pulse={metrics.stockBajo > 0}
        />
        <StatCard
          title="Sin stock"
          value={metrics.sinStock}
          subtitle="agotados"
          icon={PackageX}
          accent="red"
          href="/productos"
          pulse={metrics.sinStock > 0}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area chart — ventas por período */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-foreground">{chartConfig.title}</h2>
              <p className="text-xs text-muted-foreground">{chartConfig.subtitle}</p>
            </div>
            {/* Period filter buttons */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
              {([
                { key: 'diario', label: 'Diario', icon: Clock },
                { key: 'semanal', label: 'Semanal', icon: CalendarDays },
                { key: 'mensual', label: 'Mensual', icon: Calendar },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setPeriodo(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    periodo === key
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={11} />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartConfig.data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey={chartConfig.xKey}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={periodo === 'diario' ? 3 : 0}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v === 0 ? '0' : `S/${(v / 1000).toFixed(0)}k`}
                width={42}
              />
              <Tooltip content={<GraficoTooltip />} />
              <Area
                type="monotone"
                dataKey="ventas"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#gradVentas)"
                dot={false}
                activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 productos — ranking con barras de progreso */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Flame size={14} className="text-orange-500" />
              Top 5 Más Vendidos
            </h2>
            <Link
              href="/productos"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          {topProductos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground">
              <BarChart3 size={32} className="opacity-20 mb-2" />
              <p className="text-xs">Sin datos de ventas aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProductos.map((p, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        i === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                        : i === 1 ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                        : i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300'
                        : 'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{p.nombre}</p>
                        {p.categoria && (
                          <p className="text-[10px] text-muted-foreground">{p.categoria}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-primary">{p.total_vendido} uds</p>
                      <p className="text-[10px] text-muted-foreground">
                        S/ {p.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                  <div className="ml-7 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-zinc-400' : i === 2 ? 'bg-orange-400' : 'bg-primary/60'
                      }`}
                      style={{ width: `${Math.round((p.total_vendido / maxVendido) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Ventas recientes */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Ventas recientes</h2>
            <Link
              href="/ventas"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowRight size={11} />
            </Link>
          </div>

          {ventasRecientes.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ShoppingCart size={32} className="mx-auto opacity-20 mb-2" />
              <p className="text-xs">No hay ventas registradas aún</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {ventasRecientes.map(v => {
                const productosNombres = (v.venta_detalle ?? [])
                  .map(d => d.productos?.nombre)
                  .filter(Boolean)
                const resumen = productosNombres.length === 0
                  ? '—'
                  : productosNombres.length === 1
                  ? productosNombres[0]!
                  : `${productosNombres[0]} +${productosNombres.length - 1} más`

                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 py-3 hover:bg-muted/40 px-2 -mx-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-primary">{getInitials(v.cliente_nombre)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {v.cliente_nombre ?? <span className="italic font-normal text-muted-foreground">Consumidor final</span>}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{resumen}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        S/ {Number(v.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{formatFecha(v.fecha)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Alertas de inventario */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-500" />
              Alertas de inventario
            </h2>
            <Link
              href="/productos"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              Gestionar <ArrowRight size={11} />
            </Link>
          </div>

          {stockCritico.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                <Package size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold">¡Todo el stock OK!</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">No hay alertas de inventario</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stockCritico.map(p => (
                <div key={p.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${p.stock === 0 ? 'bg-red-500' : 'bg-orange-500'} animate-pulse`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{p.nombre}</p>
                    {p.categorias && (
                      <p className="text-[10px] text-muted-foreground">{p.categorias.nombre}</p>
                    )}
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    p.stock === 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
