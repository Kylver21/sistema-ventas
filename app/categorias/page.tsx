'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Plus, TrendingUp } from 'lucide-react'
import { categorias, distribucionVentas } from '@/lib/mock-data'
import { Breadcrumbs } from '@/components/breadcrumbs'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function CategoriasPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categorías</h1>
          <p className="text-muted-foreground">Gestiona las categorías de tus productos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Distribución de Ventas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribucionVentas}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.nombre}
                outerRadius={100}
                fill="#8884d8"
                dataKey="valor"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} ventas`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Productos por Categoría</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categorias}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="nombre" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Bar dataKey="productos" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Categoría</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Productos</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Ventas</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Porcentaje</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => {
                const totalVentas = categorias.reduce((sum, cat) => sum + cat.ventas, 0)
                const percentage = ((categoria.ventas / totalVentas) * 100).toFixed(1)
                return (
                  <tr key={categoria.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-foreground">{categoria.nombre}</td>
                    <td className="py-4 px-6 text-sm text-foreground text-center">{categoria.productos}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-foreground text-center">{categoria.ventas}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{percentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                        Editar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
