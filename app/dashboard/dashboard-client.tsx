'use client'

import { TrendingUp, DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { Breadcrumbs } from '@/components/breadcrumbs'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface Metrics {
  ingresos: string
  ingresosChange: number
  ordenes: string
  ordenesChange: number
  productos: number
  stockBajo: number
}

interface VentaMensual {
  mes: string
  ventas: number
}

interface VentaReciente {
  id: number
  cliente_nombre: string | null
  fecha: string
  total: number
  venta_detalle: { productos: { nombre: string } | null }[]
}

interface Props {
  metrics: Metrics
  ventasMensuales: VentaMensual[]
  ventasRecientes: VentaReciente[]
}

export function DashboardClient({ metrics, ventasMensuales, ventasRecientes }: Props) {
  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Ingresos del Mes"
          value={metrics.ingresos}
          change={metrics.ingresosChange}
          icon={DollarSign}
        />
        <KPICard
          title="Órdenes del Mes"
          value={metrics.ordenes}
          change={metrics.ordenesChange}
          icon={ShoppingCart}
        />
        <KPICard
          title="Total Productos"
          value={metrics.productos.toString()}
          change={null}
          icon={Package}
        />
        <KPICard
          title="Stock Bajo"
          value={metrics.stockBajo.toString()}
          change={null}
          icon={AlertTriangle}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ventas Mensuales ({new Date().getFullYear()})</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasMensuales}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(v: number) => [`S/ ${v.toLocaleString('es-PE')}`, 'Ventas']}
              />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="var(--primary)" strokeWidth={2}
                dot={{ fill: 'var(--primary)', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart small */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Últimos 6 Meses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ventasMensuales.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(v: number) => [`S/ ${v.toLocaleString('es-PE')}`, 'Ventas']}
              />
              <Bar dataKey="ventas" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Ventas Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Productos</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Total</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ventasRecientes.length > 0 ? ventasRecientes.map((v) => (
                <tr key={v.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-foreground">
                    {v.cliente_nombre ?? <span className="italic text-muted-foreground">Consumidor final</span>}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground max-w-[220px] truncate">
                    {(v.venta_detalle ?? []).map(d => d.productos?.nombre).filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-right text-foreground">
                    S/ {Number(v.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{v.fecha}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No hay ventas registradas aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
