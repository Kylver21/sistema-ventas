'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ModalNuevaCategoria } from '@/components/modals/modal-nueva-categoria'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface CategoriaConConteo {
  id: number
  nombre: string
  descripcion: string | null
  total_productos: number
}

interface Props {
  initialCategorias: CategoriaConConteo[]
}

export function CategoriasClient({ initialCategorias }: Props) {
  const [categorias, setCategorias] = useState(initialCategorias)

  useEffect(() => { setCategorias(initialCategorias) }, [initialCategorias])

  const totalProductos = categorias.reduce((s, c) => s + c.total_productos, 0)

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categorías</h1>
          <p className="text-muted-foreground">Gestiona las categorías de tus productos</p>
        </div>
        <ModalNuevaCategoria onCreated={() => {}} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Distribución de Productos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorias}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.nombre}
                outerRadius={100}
                dataKey="total_productos"
              >
                {categorias.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} productos`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

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
              <Bar dataKey="total_productos" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Categoría</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Descripción</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Productos</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Porcentaje</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => {
                const pct = totalProductos === 0 ? 0 : (cat.total_productos / totalProductos * 100)
                return (
                  <tr key={cat.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-foreground">{cat.nombre}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{cat.descripcion ?? '—'}</td>
                    <td className="py-4 px-6 text-sm text-center text-foreground">{cat.total_productos}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{pct.toFixed(1)}%</span>
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
