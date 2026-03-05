'use client'

import { useState, useEffect } from 'react'
import { Search, Download } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ModalNuevaVenta } from '@/components/modals/modal-nueva-venta'
import type { Venta } from '@/lib/supabase/types'

const ITEMS_PER_PAGE = 8

interface ProductoOption {
  id: number
  nombre: string
  precio: number
  stock: number
  codigo_barras?: string | null
}

interface Props {
  initialVentas: Venta[]
  productos: ProductoOption[]
}

export function VentasClient({ initialVentas, productos }: Props) {
  const [ventas, setVentas] = useState<Venta[]>(initialVentas)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => { setVentas(initialVentas) }, [initialVentas])

  const filtered = ventas.filter(v => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    const matchCliente = (v.cliente_nombre ?? 'Consumidor final').toLowerCase().includes(q)
    const matchProducto = (v.venta_detalle ?? []).some(d =>
      (d.productos?.nombre ?? '').toLowerCase().includes(q)
    )
    return matchCliente || matchProducto
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const handleSearch = (v: string) => { setSearchTerm(v); setCurrentPage(1) }
  const handleCreated = () => setCurrentPage(1)

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
          <p className="text-muted-foreground">Gestiona todas tus ventas y transacciones</p>
        </div>
        <ModalNuevaVenta productos={productos} onCreated={handleCreated} />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente o producto..."
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground text-sm"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-foreground text-sm">
          <Download size={16} /> Exportar
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">#</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Cliente</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Productos</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Items</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Total</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map(v => {
                const detalle = v.venta_detalle ?? []
                const nombresProductos = detalle
                  .map(d => d.productos?.nombre ? `${d.productos.nombre} x${d.cantidad}` : '—')
                  .join(', ')
                return (
                  <tr key={v.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 text-sm text-muted-foreground">#{v.id}</td>
                    <td className="py-4 px-6 text-sm font-medium text-foreground">
                      {v.cliente_nombre ?? <span className="text-muted-foreground italic">Consumidor final</span>}
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground max-w-xs truncate" title={nombresProductos}>
                      {nombresProductos || '—'}
                    </td>
                    <td className="py-4 px-6 text-sm text-center text-foreground">{detalle.length}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-right text-foreground">
                      S/ {Number(v.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{v.fecha}</td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No se encontraron ventas
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
          {filtered.length === 0
            ? 'Sin resultados'
            : `Mostrando ${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} de ${filtered.length} ventas`}
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
            className="px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted text-sm text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            ← Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === safePage ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted text-foreground'}`}>
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            className="px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted text-sm text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )
}

