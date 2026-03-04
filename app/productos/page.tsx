'use client'

import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { productos } from '@/lib/mock-data'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProductos.map((producto) => (
          <div
            key={producto.id}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{producto.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{producto.categoria}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-muted rounded-md transition-colors text-foreground">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 hover:bg-red-100 rounded-md transition-colors text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="pt-2 border-t border-border">
                <p className="text-2xl font-bold text-primary">{producto.precio}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className="text-lg font-semibold text-foreground">{producto.stock}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ventas</p>
                  <p className="text-lg font-semibold text-foreground">{producto.ventas}</p>
                </div>
              </div>

              {/* Stock Alert */}
              {producto.stock < 20 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertCircle size={16} className="text-yellow-600" />
                  <p className="text-xs font-medium text-yellow-600">Stock bajo</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProductos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      )}
    </div>
  )
}
