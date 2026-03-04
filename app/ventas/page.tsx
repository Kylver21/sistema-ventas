'use client'

import { useState } from 'react'
import { Search, Download } from 'lucide-react'
import { ventasRecientes as initialVentas } from '@/lib/mock-data'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ModalNuevaVenta } from '@/components/modals/modal-nueva-venta'

const ITEMS_PER_PAGE = 5

export default function VentasPage() {
  const [ventas, setVentas] = useState(initialVentas)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredVentas = ventas.filter(venta => {
    const matchesSearch =
      venta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.producto.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'Todos' || venta.estado === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.max(1, Math.ceil(filteredVentas.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedVentas = filteredVentas.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  )

  const handleSearch = (value: string) => { setSearchTerm(value); setCurrentPage(1) }
  const handleStatusFilter = (value: string) => { setSelectedStatus(value); setCurrentPage(1) }
  const handleCreated = (nueva: { cliente: string; producto: string; cantidad: number; estado: string; total: string; fecha: string }) => {
    setVentas(prev => [{ id: prev.length + 1, ...nueva }, ...prev])
    setCurrentPage(1)
  }

  const estadoStyle: Record<string, string> = {
    Completado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
          <p className="text-muted-foreground">Gestiona todas tus ventas y transacciones</p>
        </div>
        <ModalNuevaVenta onCreated={handleCreated} />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente o producto..."
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground text-sm"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Filter by Status */}
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground cursor-pointer text-sm"
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
              {paginatedVentas.length > 0 ? (
                paginatedVentas.map((venta) => (
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${estadoStyle[venta.estado] ?? ''}`}>
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredVentas.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredVentas.length)} de {filteredVentas.length} ventas
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-sm text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === safePage
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:bg-muted text-foreground'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-sm text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )
}
