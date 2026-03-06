'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import {
  Search, Edit2, Trash2, Barcode,
  Minus, Plus, ChevronDown, X, Package,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ModalNuevoProducto } from '@/components/modals/modal-nuevo-producto'
import { ajustarStock } from '@/lib/actions/productos'

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

type StockNivel = 'agotado' | 'critico' | 'bajo' | 'optimo'

const stockLevel = (s: number): StockNivel =>
  s === 0 ? 'agotado' : s < 5 ? 'critico' : s < 15 ? 'bajo' : 'optimo'

const stockBadgeClass: Record<StockNivel, string> = {
  agotado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800',
  critico: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800',
  bajo:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800',
  optimo:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800',
}

const stockLabel: Record<StockNivel, string> = {
  agotado: 'Agotado',
  critico: 'Crítico',
  bajo:    'Stock bajo',
  optimo:  'En stock',
}

export function ProductosClient({ initialProductos, categorias }: Props) {
  const [productos, setProductos] = useState(initialProductos)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas')
  const [soloStockBajo, setSoloStockBajo] = useState(false)
  const [ocultarAgotados, setOcultarAgotados] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [, startTransition] = useTransition()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setProductos(initialProductos) }, [initialProductos])

  useEffect(() => { searchRef.current?.focus() }, [])

  const categoriasDisponibles = ['Todas', ...categorias.map(c => c.nombre)]

  const filtered = productos.filter(p => {
    const q = searchTerm.toLowerCase()
    const matchSearch = !searchTerm
      || p.nombre.toLowerCase().includes(q)
      || (p.codigo_barras ?? '').includes(searchTerm)
      || (p.categorias?.nombre ?? '').toLowerCase().includes(q)
    const matchCat = categoriaFiltro === 'Todas' || (p.categorias?.nombre ?? '') === categoriaFiltro
    const nivel = stockLevel(p.stock)
    const matchStockBajo = !soloStockBajo || nivel !== 'optimo'
    const matchAgotados = !ocultarAgotados || p.stock > 0
    return matchSearch && matchCat && matchStockBajo && matchAgotados
  })

  const stockStats = {
    total: productos.length,
    optimo: productos.filter(p => stockLevel(p.stock) === 'optimo').length,
    atencion: productos.filter(p => stockLevel(p.stock) !== 'optimo').length,
  }

  const handleAjuste = (id: number, delta: number) => {
    // Optimistic UI update
    setProductos(prev =>
      prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)
    )
    setPendingIds(prev => new Set(prev).add(id))
    startTransition(async () => {
      try {
        await ajustarStock(id, delta)
      } catch {
        // Revert on server error
        setProductos(prev =>
          prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock - delta) } : p)
        )
      } finally {
        setPendingIds(prev => { const s = new Set(prev); s.delete(id); return s })
      }
    })
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs />

      {/* Title + action */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground text-sm">Gestiona tu catálogo e inventario</p>
        </div>
        <ModalNuevoProducto categorias={categorias} />
      </div>

      {/* Stock summary pills */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-xs font-medium text-muted-foreground">
          <Package size={12} /> {stockStats.total} productos
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {stockStats.optimo} en stock óptimo
        </div>
        <button
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            soloStockBajo
              ? 'bg-orange-500 text-white'
              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
          }`}
          onClick={() => setSoloStockBajo(v => !v)}
        >
          {stockStats.atencion} requieren atención
          {soloStockBajo && <X size={12} className="ml-0.5" />}
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search with autofocus — compatible with barcode scanner */}
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar por nombre o código de barras..."
            className="w-full pl-9 pr-9 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <button
            onClick={() => setCatOpen(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors min-w-[160px] justify-between"
          >
            <span>{categoriaFiltro}</span>
            <ChevronDown size={14} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
          </button>
          {catOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[180px]">
              {categoriasDisponibles.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategoriaFiltro(cat); setCatOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    cat === categoriaFiltro
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Toggle ocultar agotados */}
        <button
          onClick={() => setOcultarAgotados(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
            ocultarAgotados
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-foreground hover:bg-muted'
          }`}
        >
          Ocultar agotados {ocultarAgotados && <X size={12} />}
        </button>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Package size={40} className="opacity-20" />
          <p className="text-sm">No se encontraron productos con los filtros actuales</p>
          <button
            onClick={() => { setSearchTerm(''); setCategoriaFiltro('Todas'); setSoloStockBajo(false); setOcultarAgotados(false) }}
            className="text-xs underline hover:text-foreground transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(producto => {
            const nivel = stockLevel(producto.stock)
            const margen = producto.precio_compra && producto.precio_compra > 0
              ? ((producto.precio - producto.precio_compra) / producto.precio_compra * 100)
              : null
            const isAdjusting = pendingIds.has(producto.id)

            return (
              <div
                key={producto.id}
                className={`bg-card border rounded-xl p-4 hover:shadow-md transition-all space-y-3 ${
                  nivel === 'agotado' || nivel === 'critico'
                    ? 'border-red-200 dark:border-red-900/50'
                    : nivel === 'bajo'
                    ? 'border-orange-200 dark:border-orange-900/50'
                    : 'border-border'
                }`}
              >
                {/* Header: name + category + actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                      {producto.nombre}
                    </h3>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-full font-medium">
                      {producto.categorias?.nombre ?? 'Sin categoría'}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 size={13} />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-muted-foreground hover:text-red-600">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Price row */}
                <div className="flex items-end justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Precio venta</p>
                    <p className="text-xl font-bold text-primary">
                      S/ {Number(producto.precio).toFixed(2)}
                    </p>
                  </div>
                  {producto.precio_compra !== null && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Costo</p>
                      <p className="text-sm font-medium text-foreground">
                        S/ {Number(producto.precio_compra).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stock row with quick adjust */}
                <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Stock</p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-bold transition-opacity ${
                        nivel === 'agotado' || nivel === 'critico' ? 'text-red-600 dark:text-red-400'
                        : nivel === 'bajo' ? 'text-orange-600 dark:text-orange-400'
                        : 'text-foreground'
                      } ${isAdjusting ? 'opacity-50' : ''}`}>
                        {producto.stock}
                      </span>
                      <span className="text-xs text-muted-foreground">und.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAjuste(producto.id, -1)}
                      disabled={producto.stock === 0 || isAdjusting}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Quitar 1 unidad"
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      onClick={() => handleAjuste(producto.id, 1)}
                      disabled={isAdjusting}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Agregar 1 unidad"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Badge + margen */}
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${stockBadgeClass[nivel]}`}>
                    {stockLabel[nivel]}
                  </span>
                  {margen !== null && (
                    <span className={`text-xs font-semibold ${margen > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                      {margen > 0 ? '+' : ''}{margen.toFixed(0)}% margen
                    </span>
                  )}
                </div>

                {/* Barcode */}
                {producto.codigo_barras && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground border-t border-border pt-2">
                    <Barcode size={12} />
                    <span className="font-mono truncate">{producto.codigo_barras}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-center pb-2">
          Mostrando {filtered.length} de {productos.length} productos
        </p>
      )}

      {/* Backdrop to close category dropdown */}
      {catOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setCatOpen(false)} />
      )}
    </div>
  )
}
