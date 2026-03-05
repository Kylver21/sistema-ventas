'use client'

import { useState, useEffect } from 'react'
import { Search, Edit2, Trash2, AlertCircle, Barcode } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ModalNuevoProducto } from '@/components/modals/modal-nuevo-producto'

interface Producto {
  id: number
  nombre: string
  precio: number
  precio_compra: number | null
  stock: number
  codigo_barras: string | null
  categorias?: { id: number; nombre: string } | null
}

interface CategoriaOption {
  id: number
  nombre: string
}

interface Props {
  initialProductos: Producto[]
  categorias: CategoriaOption[]
}

export function ProductosClient({ initialProductos, categorias }: Props) {
  const [productos, setProductos] = useState(initialProductos)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { setProductos(initialProductos) }, [initialProductos])

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categorias?.nombre ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
        </div>
        <ModalNuevoProducto categorias={categorias} />
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-2.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((producto) => {
          const margen = producto.precio_compra && producto.precio_compra > 0
            ? ((producto.precio - producto.precio_compra) / producto.precio_compra * 100)
            : null
          return (
          <div key={producto.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground leading-tight">{producto.nombre}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    {producto.categorias?.nombre ?? 'Sin categoría'}
                  </span>
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <button className="p-1.5 hover:bg-muted rounded-md transition-colors text-foreground">
                    <Edit2 size={14} />
                  </button>
                  <button className="p-1.5 hover:bg-red-100 rounded-md transition-colors text-red-600 dark:hover:bg-red-900/20">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Prices */}
              <div className="flex items-end justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Precio venta</p>
                  <p className="text-xl font-bold text-primary">
                    S/ {Number(producto.precio).toFixed(2)}
                  </p>
                </div>
                {producto.precio_compra !== null && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Costo</p>
                    <p className="text-sm font-medium text-foreground">S/ {Number(producto.precio_compra).toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className="text-lg font-bold text-foreground">{producto.stock}
                    <span className="text-xs font-normal text-muted-foreground ml-1">und.</span>
                  </p>
                </div>
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-xs text-muted-foreground">Margen</p>
                  <p className={`text-lg font-bold ${margen !== null && margen > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                    {margen !== null ? `${margen.toFixed(0)}%` : '—'}
                  </p>
                </div>
              </div>

              {/* Barcode */}
              {producto.codigo_barras && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Barcode size={13} />
                  <span className="font-mono">{producto.codigo_barras}</span>
                </div>
              )}

              {/* Stock Alert */}
              {producto.stock < 10 && (
                <div className="flex items-center gap-2 p-2.5 bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-md">
                  <AlertCircle size={14} className="text-yellow-600 shrink-0" />
                  <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                    {producto.stock === 0 ? 'Sin stock' : `Stock bajo — quedan ${producto.stock}`}
                  </p>
                </div>
              )}
            </div>
          </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      )}
    </div>
  )
}
