'use client'

import { useState } from 'react'
import { Search, Download, Plus, Filter } from 'lucide-react'
import { ventasRecientes } from '@/lib/mock-data'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function VentasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos')

  const filteredVentas = ventasRecientes.filter(venta => {
    const matchesSearch = venta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venta.producto.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'Todos' || venta.estado === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
          <p className="text-muted-foreground">Gestiona todas tus ventas y transacciones</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={20} />
          Nueva Venta
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente o producto..."
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter by Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer"
        >
          <option>Todos</option>
          <option>Completado</option>
          <option>Pendiente</option>
          <option>Cancelado</option>
        </select>

        {/* Export */}
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
          <Download size={18} />
          Exportar
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Cliente</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Producto</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Cantidad</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Total</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Fecha</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Estado</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVentas.length > 0 ? (
                filteredVentas.map((venta) => (
                  <tr
                    key={venta.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-foreground font-medium">{venta.cliente}</td>
                    <td className="py-4 px-6 text-sm text-foreground">{venta.producto}</td>
                    <td className="py-4 px-6 text-sm text-foreground text-center">{venta.cantidad}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-foreground text-right">{venta.total}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{venta.fecha}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                          venta.estado === 'Completado'
                            ? 'bg-green-100 text-green-800'
                            : venta.estado === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {venta.estado}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-muted-foreground">No se encontraron ventas</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredVentas.length} de {ventasRecientes.length} ventas
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-foreground disabled:opacity-50">
            Anterior
          </button>
          <button className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}
