'use client'

import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { dashboardMetrics, ventasMensuales, ventasRecientes } from '@/lib/mock-data'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs />
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Ventas Totales"
          value={dashboardMetrics.ventas}
          change={dashboardMetrics.ventasChange}
          icon={TrendingUp}
        />
        <KPICard
          title="Ingresos"
          value={dashboardMetrics.ingresos}
          change={dashboardMetrics.ingresosChange}
          icon={DollarSign}
        />
        <KPICard
          title="Órdenes"
          value={dashboardMetrics.ordenes}
          change={dashboardMetrics.ordenesChange}
          icon={ShoppingCart}
        />
        <KPICard
          title="Clientes"
          value={dashboardMetrics.clientes}
          change={dashboardMetrics.clientesChange}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Ventas */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ventas Mensuales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasMensuales}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--primary)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics Card */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Estadísticas</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Promedio Diario</p>
              <p className="text-2xl font-bold text-foreground">$1,235</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ticket Promedio</p>
              <p className="text-2xl font-bold text-foreground">$125</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
              <p className="text-2xl font-bold text-foreground">3.2%</p>
            </div>
          </div>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Cantidad</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Total</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventasRecientes.map((venta) => (
                <tr key={venta.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-foreground">{venta.cliente}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{venta.producto}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{venta.cantidad}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-foreground">{venta.total}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{venta.fecha}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      venta.estado === 'Completado'
                        ? 'bg-green-100 text-green-800'
                        : venta.estado === 'Pendiente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {venta.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
