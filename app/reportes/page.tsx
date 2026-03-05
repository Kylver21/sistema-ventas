'use client'

import { Download, Eye, Plus, Calendar, Filter } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">Genera y descarga reportes de tu negocio</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={20} />
          Nuevo Reporte
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Calendar size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <select className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer">
            <option>Últimos 30 días</option>
            <option>Últimos 90 días</option>
            <option>Últimos 12 meses</option>
            <option>Personalizado</option>
          </select>
        </div>
        <button className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-foreground flex items-center gap-2">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {/* Reports Grid */}
      {/* Reportes generados — próximamente desde Supabase */}
      <div className="bg-card border border-border rounded-lg p-10 text-center space-y-2">
        <p className="text-muted-foreground text-sm">No hay reportes generados aún.</p>
        <p className="text-muted-foreground text-xs">La funcionalidad de reportes se conectará a Supabase próximamente.</p>
      </div>

      {/* Report Templates */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Plantillas de Reportes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Ventas Mensuales', desc: 'Resumen de ventas por mes' },
            { name: 'Análisis de Clientes', desc: 'Comportamiento y segmentación' },
            { name: 'Rentabilidad', desc: 'Análisis de ganancia neta' },
            { name: 'Inventario', desc: 'Estado actual del stock' },
            { name: 'Predicciones', desc: 'Proyecciones futuras' },
            { name: 'Comparativas', desc: 'Análisis de períodos' },
          ].map((template, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="font-semibold text-foreground">{template.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{template.desc}</p>
              <button className="mt-3 text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                Usar plantilla
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
