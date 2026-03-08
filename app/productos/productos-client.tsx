'use client'

import { useState, useEffect, useRef, useTransition, useMemo } from 'react'
import type { ElementType } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Search, Edit2, Trash2, Barcode, Minus, Plus, ChevronDown, X, Package,
  CheckCircle2, AlertTriangle, TrendingDown, TrendingUp,
  ShoppingCart, ArrowUpDown, DollarSign, Flame, BarChart2, Tag,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ModalNuevoProducto } from '@/components/modals/modal-nuevo-producto'
import {
  ajustarStock, updateProducto, deleteProducto,
  type ProductoVentaStat,
} from '@/lib/actions/productos'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Producto {
  id: number
  nombre: string
  precio: number
  precio_compra: number | null
  stock: number
  codigo_barras: string | null
  categorias?: { id: number; nombre: string } | null
}

interface ProductoConStats extends Producto {
  total_vendido: number
  ingresos: number
}

interface CategoriaOption {
  id: number
  nombre: string
}

interface Props {
  initialProductos: Producto[]
  categorias: CategoriaOption[]
  statsVentas: ProductoVentaStat[]
}

type StockNivel = 'agotado' | 'critico' | 'bajo' | 'optimo'
type StockFiltro = 'todos' | 'disponible' | 'bajo' | 'agotado'
type PrecioOrden = 'ninguno' | 'mayor' | 'menor'
type MargenFiltro = 'todos' | 'alto' | 'normal' | 'bajo_margen' | 'sin_datos'
type VentaFiltro = 'todos' | 'con_ventas' | 'sin_ventas'

// ─── Stock helpers ────────────────────────────────────────────────────────────

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

// ─── Zod schema (edit) ────────────────────────────────────────────────────────

const editSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  categoria_id: z.coerce.number().int().min(1, 'Selecciona una categoría'),
  precio: z.coerce.number().positive('Debe ser mayor a 0'),
  precio_compra: z.coerce
    .number()
    .nonnegative('No puede ser negativo')
    .optional()
    .or(z.literal('')),
  stock: z.coerce.number().int().min(0, 'No puede ser negativo'),
  codigo_barras: z.string().optional().or(z.literal('')),
})
type EditForm = z.infer<typeof editSchema>

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastMsg { id: number; message: string; type: 'success' | 'error' }

function ToastStack({ toasts, onClose }: { toasts: ToastMsg[]; onClose: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border transition-all ${
            t.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/80 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
          }`}
        >
          {t.type === 'success'
            ? <CheckCircle2 size={15} className="shrink-0 text-green-600 dark:text-green-400" />
            : <AlertTriangle size={15} className="shrink-0 text-red-600 dark:text-red-400" />}
          <span>{t.message}</span>
          <button onClick={() => onClose(t.id)} className="ml-1 opacity-50 hover:opacity-100 transition-opacity">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  producto: Producto
  categorias: CategoriaOption[]
  allProductos: Producto[]
  onClose: () => void
  onSaved: (updated: Producto) => void
  onError: (msg: string) => void
}

function ModalEditarProducto({ producto, categorias, allProductos, onClose, onSaved, onError }: EditModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      nombre: producto.nombre,
      categoria_id: producto.categorias?.id ?? 0,
      precio: producto.precio,
      precio_compra: producto.precio_compra ?? '',
      stock: producto.stock,
      codigo_barras: producto.codigo_barras ?? '',
    },
  })

  const onSubmit = async (data: EditForm) => {
    // Client-side unique barcode check
    const codigoNuevo = data.codigo_barras?.toString().trim() || null
    if (codigoNuevo) {
      const duplicado = allProductos.find(
        p => p.id !== producto.id && p.codigo_barras === codigoNuevo
      )
      if (duplicado) {
        setError('codigo_barras', { message: `Ya está en uso por "${duplicado.nombre}"` })
        return
      }
    }

    try {
      await updateProducto(producto.id, {
        nombre: data.nombre,
        categoria_id: data.categoria_id,
        precio: data.precio,
        precio_compra: data.precio_compra ? Number(data.precio_compra) : undefined,
        stock: data.stock,
        codigo_barras: codigoNuevo ?? undefined,
      })

      const catObj = categorias.find(c => c.id === data.categoria_id)
      onSaved({
        ...producto,
        nombre: data.nombre,
        precio: data.precio,
        precio_compra: data.precio_compra ? Number(data.precio_compra) : null,
        stock: data.stock,
        codigo_barras: codigoNuevo,
        categorias: catObj ? { id: catObj.id, nombre: catObj.nombre } : producto.categorias,
      })
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al actualizar el producto')
    }
  }

  const inputCls = 'w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring'
  const errCls = 'text-xs text-destructive mt-1'

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nombre del producto</label>
            <input {...register('nombre')} className={inputCls} placeholder="Ej: Arroz extra bolsa 1kg" />
            {errors.nombre && <p className={errCls}>{errors.nombre.message}</p>}
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Categoría</label>
            <select {...register('categoria_id')} className={inputCls}>
              <option value="">Seleccionar categoría...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            {errors.categoria_id && <p className={errCls}>{errors.categoria_id.message}</p>}
          </div>

          {/* Precios + Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Precio venta (S/)</label>
              <input {...register('precio')} type="number" step="0.01" min={0} placeholder="0.00" className={inputCls} />
              {errors.precio && <p className={errCls}>{errors.precio.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Costo (S/) <span className="text-muted-foreground font-normal text-[11px]">(opcional)</span>
              </label>
              <input {...register('precio_compra')} type="number" step="0.01" min={0} placeholder="0.00" className={inputCls} />
              {errors.precio_compra && <p className={errCls}>{errors.precio_compra.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Stock</label>
              <input {...register('stock')} type="number" min={0} placeholder="0" className={inputCls} />
              {errors.stock && <p className={errCls}>{errors.stock.message}</p>}
            </div>
          </div>

          {/* Código de barras */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Código de barras <span className="text-muted-foreground font-normal text-[11px]">(opcional)</span>
            </label>
            <input {...register('codigo_barras')} className={`${inputCls} font-mono`} placeholder="Ej: 7501055300120" />
            {errors.codigo_barras && <p className={errCls}>{errors.codigo_barras.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Filter dropdown ─────────────────────────────────────────────────────────

function FilterDropdown({
  label, icon: Icon, value, options, onChange, active,
}: {
  label: string
  icon: ElementType
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  active: boolean
}) {
  const [open, setOpen] = useState(false)
  const currentLabel = options.find(o => o.value === value)?.label ?? label
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold transition-all ${
          active
            ? 'bg-primary border-primary text-primary-foreground'
            : 'bg-card border-border text-foreground hover:bg-muted'
        }`}
      >
        <Icon size={11} className="shrink-0" />
        <span>{active ? currentLabel : label}</span>
        <ChevronDown size={11} className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[200px]">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                  opt.value === value ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <CheckCircle2 size={12} className="shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Ranking list ─────────────────────────────────────────────────────────────

function RankingList({
  title, icon: Icon, iconClass, items, onSelect, emptyText,
}: {
  title: string
  icon: ElementType
  iconClass: string
  items: ProductoConStats[]
  onSelect: (nombre: string) => void
  emptyText: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Icon size={14} className={iconClass} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="ml-auto text-[11px] text-muted-foreground">{items.length} productos</span>
      </div>
      {items.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-muted-foreground">{emptyText}</div>
      ) : (
        <div className="divide-y divide-border">
          {items.slice(0, 5).map((p, i) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.nombre)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left"
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                i === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                : i === 1 ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                : i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300'
                : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{p.nombre}</p>
                <p className="text-[10px] text-muted-foreground">S/ {p.ingresos.toFixed(2)} ingresado</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-primary">{p.total_vendido}</p>
                <p className="text-[10px] text-muted-foreground">uds</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductosClient({ initialProductos, categorias, statsVentas }: Props) {
  const router = useRouter()
  const [productos, setProductos] = useState(initialProductos)

  // Merge products with sales stats
  const productosConStats = useMemo<ProductoConStats[]>(() =>
    productos.map(p => {
      const s = statsVentas.find(sv => sv.producto_id === p.id)
      return { ...p, total_vendido: s?.total_vendido ?? 0, ingresos: s?.ingresos ?? 0 }
    }),
    [productos, statsVentas]
  )

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas')
  const [stockFiltro, setStockFiltro] = useState<StockFiltro>('todos')
  const [precioOrden, setPrecioOrden] = useState<PrecioOrden>('ninguno')
  const [margenFiltro, setMargenFiltro] = useState<MargenFiltro>('todos')
  const [ventaFiltro, setVentaFiltro] = useState<VentaFiltro>('todos')
  const [catOpen, setCatOpen] = useState(false)
  const [rankingOpen, setRankingOpen] = useState(true)

  // Operations
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [deletingProducto, setDeletingProducto] = useState<Producto | null>(null)
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [, startTransition] = useTransition()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setProductos(initialProductos) }, [initialProductos])
  useEffect(() => { searchRef.current?.focus() }, [])

  const addToast = (message: string, type: ToastMsg['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  // ── KPIs (todos calculados en tiempo real sobre la lista actual) ────────────
  const kpis = useMemo(() => {
    const conMargen = productosConStats.filter(p => p.precio_compra !== null && p.precio_compra > 0)
    const margenProm = conMargen.length > 0
      ? conMargen.reduce((acc, p) => acc + (p.precio - p.precio_compra!) / p.precio_compra! * 100, 0) / conMargen.length
      : null
    return {
      total: productosConStats.length,
      stockBajo: productosConStats.filter(p => p.stock > 0 && p.stock < 10).length,
      sinStock: productosConStats.filter(p => p.stock === 0).length,
      margenProm,
      valorInventario: productosConStats.reduce((acc, p) => acc + p.precio * p.stock, 0),
      nuncaVendidos: productosConStats.filter(p => p.total_vendido === 0).length,
    }
  }, [productosConStats])

  // ── Rankings: más/menos vendidos ──────────────────────────────────────────
  const masVendidos = useMemo(() =>
    [...productosConStats].filter(p => p.total_vendido > 0)
      .sort((a, b) => b.total_vendido - a.total_vendido),
    [productosConStats]
  )
  const menosVendidos = useMemo(() =>
    [...productosConStats].filter(p => p.total_vendido > 0)
      .sort((a, b) => a.total_vendido - b.total_vendido),
    [productosConStats]
  )

  // ── Filtered + sorted ──────────────────────────────────────────────────────
  const categoriasDisponibles = useMemo(
    () => ['Todas', ...categorias.map(c => c.nombre)],
    [categorias]
  )

  const filtered = useMemo((): ProductoConStats[] => {
    const q = searchTerm.toLowerCase()
    let result = productosConStats.filter(p => {
      const matchSearch = !searchTerm
        || p.nombre.toLowerCase().includes(q)
        || (p.codigo_barras ?? '').includes(searchTerm)
      const matchCat = categoriaFiltro === 'Todas' || (p.categorias?.nombre ?? '') === categoriaFiltro
      const matchStock =
        stockFiltro === 'todos' ? true
        : stockFiltro === 'disponible' ? p.stock > 0
        : stockFiltro === 'bajo' ? (p.stock > 0 && p.stock < 10)
        : p.stock === 0
      const m = p.precio_compra && p.precio_compra > 0
        ? (p.precio - p.precio_compra) / p.precio_compra * 100 : null
      const matchMargen =
        margenFiltro === 'todos' ? true
        : margenFiltro === 'alto' ? (m !== null && m > 30)
        : margenFiltro === 'normal' ? (m !== null && m >= 15 && m <= 30)
        : margenFiltro === 'bajo_margen' ? (m !== null && m < 15)
        : m === null
      const matchVentas =
        ventaFiltro === 'todos' ? true
        : ventaFiltro === 'con_ventas' ? p.total_vendido > 0
        : p.total_vendido === 0
      return matchSearch && matchCat && matchStock && matchMargen && matchVentas
    })
    if (precioOrden === 'mayor') return [...result].sort((a, b) => b.precio - a.precio)
    if (precioOrden === 'menor') return [...result].sort((a, b) => a.precio - b.precio)
    return result
  }, [productosConStats, searchTerm, categoriaFiltro, stockFiltro, margenFiltro, ventaFiltro, precioOrden])

  // ── Active filter chips ────────────────────────────────────────────────────
  const activeChips = ([
    searchTerm && { key: 'search', label: `"${searchTerm}"`, clear: () => setSearchTerm('') },
    categoriaFiltro !== 'Todas' && { key: 'cat', label: categoriaFiltro, clear: () => setCategoriaFiltro('Todas') },
    stockFiltro !== 'todos' && {
      key: 'stock',
      label: ({ disponible: 'Disponibles', bajo: 'Stock bajo', agotado: 'Agotados' } as Record<string, string>)[stockFiltro],
      clear: () => setStockFiltro('todos'),
    },
    precioOrden !== 'ninguno' && {
      key: 'precio',
      label: precioOrden === 'mayor' ? 'Mayor precio' : 'Menor precio',
      clear: () => setPrecioOrden('ninguno'),
    },
    margenFiltro !== 'todos' && {
      key: 'margen',
      label: ({ alto: 'Margen alto', normal: 'Margen normal', bajo_margen: 'Margen bajo', sin_datos: 'Sin costo' } as Record<string, string>)[margenFiltro],
      clear: () => setMargenFiltro('todos'),
    },
    ventaFiltro !== 'todos' && {
      key: 'venta',
      label: ventaFiltro === 'con_ventas' ? 'Con ventas' : 'Sin ventas',
      clear: () => setVentaFiltro('todos'),
    },
  ] as (false | { key: string; label: string; clear: () => void })[])
    .filter((c): c is { key: string; label: string; clear: () => void } => Boolean(c))

  const clearAll = () => {
    setSearchTerm(''); setCategoriaFiltro('Todas'); setStockFiltro('todos')
    setPrecioOrden('ninguno'); setMargenFiltro('todos'); setVentaFiltro('todos')
  }

  // ── Stock quick-adjust ──────────────────────────────────────────────────────
  const handleAjuste = (id: number, delta: number) => {
    setProductos(prev =>
      prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)
    )
    setPendingIds(prev => new Set(prev).add(id))
    startTransition(async () => {
      try {
        await ajustarStock(id, delta)
      } catch {
        setProductos(prev =>
          prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock - delta) } : p)
        )
        addToast('Error al ajustar el stock', 'error')
      } finally {
        setPendingIds(prev => { const s = new Set(prev); s.delete(id); return s })
      }
    })
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = (id: number) => {
    setDeletingProducto(null)
    setProductos(prev => prev.filter(p => p.id !== id))
    startTransition(async () => {
      try {
        await deleteProducto(id)
        addToast('Producto eliminado correctamente')
        router.refresh()
      } catch {
        addToast('Error al eliminar el producto', 'error')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground text-sm">Gestiona tu catálogo e inventario</p>
        </div>
        <ModalNuevoProducto categorias={categorias} onCreated={() => router.refresh()} />
      </div>

      {/* ── KPI cards (5): total · stock bajo · sin stock · margen prom · valor inventario ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total */}
        <button
          onClick={() => { setStockFiltro('todos'); setVentaFiltro('todos') }}
          className="bg-card border border-border rounded-xl px-4 py-4 hover:shadow-sm transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors shrink-0">
              <Package size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{kpis.total}</p>
              <p className="text-xs text-muted-foreground leading-tight">Total productos</p>
            </div>
          </div>
        </button>

        {/* Stock bajo */}
        <button
          onClick={() => setStockFiltro(v => v === 'bajo' ? 'todos' : 'bajo')}
          className={`border rounded-xl px-4 py-4 hover:shadow-sm transition-all text-left ${
            stockFiltro === 'bajo' ? 'bg-orange-500 border-orange-500' : 'bg-card border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${stockFiltro === 'bajo' ? 'bg-white/20' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
              <TrendingDown size={16} className={stockFiltro === 'bajo' ? 'text-white' : 'text-orange-600 dark:text-orange-400'} />
            </div>
            <div className="min-w-0">
              <p className={`text-2xl font-bold ${stockFiltro === 'bajo' ? 'text-white' : kpis.stockBajo > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'}`}>
                {kpis.stockBajo}
              </p>
              <p className={`text-xs leading-tight ${stockFiltro === 'bajo' ? 'text-white/80' : 'text-muted-foreground'}`}>
                Stock bajo
              </p>
            </div>
            {kpis.stockBajo > 0 && stockFiltro !== 'bajo' && (
              <span className="ml-auto w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
            )}
          </div>
        </button>

        {/* Sin stock */}
        <button
          onClick={() => setStockFiltro(v => v === 'agotado' ? 'todos' : 'agotado')}
          className={`border rounded-xl px-4 py-4 hover:shadow-sm transition-all text-left ${
            stockFiltro === 'agotado' ? 'bg-red-600 border-red-600' : 'bg-card border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${stockFiltro === 'agotado' ? 'bg-white/20' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <ShoppingCart size={16} className={stockFiltro === 'agotado' ? 'text-white' : 'text-red-600 dark:text-red-400'} />
            </div>
            <div className="min-w-0">
              <p className={`text-2xl font-bold ${stockFiltro === 'agotado' ? 'text-white' : kpis.sinStock > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                {kpis.sinStock}
              </p>
              <p className={`text-xs leading-tight ${stockFiltro === 'agotado' ? 'text-white/80' : 'text-muted-foreground'}`}>
                Sin stock
              </p>
            </div>
            {kpis.sinStock > 0 && stockFiltro !== 'agotado' && (
              <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            )}
          </div>
        </button>

        {/* Margen promedio — real, calculado sobre precio_compra */}
        <button
          onClick={() => setMargenFiltro(v => v === 'alto' ? 'todos' : 'alto')}
          title="Click para filtrar margen alto (>30%)"
          className="bg-card border border-border rounded-xl px-4 py-4 hover:shadow-sm transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${
              kpis.margenProm === null ? 'bg-muted'
              : kpis.margenProm > 30 ? 'bg-green-100 dark:bg-green-900/30'
              : kpis.margenProm >= 15 ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'bg-yellow-100 dark:bg-yellow-900/30'
            }`}>
              <TrendingUp size={16} className={
                kpis.margenProm === null ? 'text-muted-foreground'
                : kpis.margenProm > 30 ? 'text-green-600 dark:text-green-400'
                : kpis.margenProm >= 15 ? 'text-blue-600 dark:text-blue-400'
                : 'text-yellow-600 dark:text-yellow-400'
              } />
            </div>
            <div>
              <p className={`text-2xl font-bold ${
                kpis.margenProm === null ? 'text-muted-foreground'
                : kpis.margenProm > 30 ? 'text-green-600 dark:text-green-400'
                : kpis.margenProm >= 15 ? 'text-foreground'
                : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {kpis.margenProm !== null ? `${kpis.margenProm.toFixed(1)}%` : '—'}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">Margen prom.</p>
            </div>
          </div>
        </button>

        {/* Valor total inventario */}
        <div className="bg-card border border-border rounded-xl px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
              <DollarSign size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground leading-snug">
                S/{' '}
                {kpis.valorInventario >= 10000
                  ? `${(kpis.valorInventario / 1000).toFixed(1)}k`
                  : kpis.valorInventario.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">Valor inventario</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rankings (colapsable) ── */}
      {masVendidos.length > 0 && (
        <div>
          <button
            onClick={() => setRankingOpen(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3 hover:text-primary transition-colors"
          >
            <BarChart2 size={15} />
            Análisis de ventas por producto
            <ChevronDown size={14} className={`transition-transform ${rankingOpen ? 'rotate-180' : ''}`} />
            <span className="text-xs font-normal text-muted-foreground ml-1">
              {masVendidos.length} con ventas
              {kpis.nuncaVendidos > 0 && ` · ${kpis.nuncaVendidos} sin movimiento`}
            </span>
          </button>
          {rankingOpen && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <RankingList
                title="Más vendidos"
                icon={Flame}
                iconClass="text-orange-500"
                items={masVendidos}
                onSelect={nombre => setSearchTerm(nombre)}
                emptyText="Sin historial de ventas"
              />
              <RankingList
                title="Menor movimiento"
                icon={TrendingDown}
                iconClass="text-blue-400"
                items={menosVendidos}
                onSelect={nombre => setSearchTerm(nombre)}
                emptyText="Sin historial de ventas"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="space-y-2.5">
        {/* Row 1: search */}
        <div className="relative">
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
            <button onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Row 2: stock chips + dropdowns */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Stock chips */}
          {(['todos', 'disponible', 'bajo', 'agotado'] as StockFiltro[]).map(opt => {
            const labels: Record<StockFiltro, string> = {
              todos: 'Todo el stock', disponible: 'Disponibles', bajo: 'Stock bajo', agotado: 'Agotados',
            }
            const badge = opt === 'bajo' ? kpis.stockBajo : opt === 'agotado' ? kpis.sinStock : null
            return (
              <button
                key={opt}
                onClick={() => setStockFiltro(v => v === opt ? 'todos' : opt)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  stockFiltro === opt
                    ? opt === 'agotado' ? 'bg-red-600 border-red-600 text-white'
                      : opt === 'bajo' ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-primary border-primary text-primary-foreground'
                    : 'bg-card border-border text-foreground hover:bg-muted'
                }`}
              >
                {labels[opt]}
                {badge !== null && badge > 0 && stockFiltro !== opt && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${opt === 'bajo' ? 'bg-orange-500' : 'bg-red-600'}`}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}

          <div className="h-4 w-px bg-border shrink-0" />

          {/* Category dropdown */}
          <div className="relative">
            <button
              onClick={() => setCatOpen(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold transition-all ${
                categoriaFiltro !== 'Todas'
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              <Tag size={11} />
              {categoriaFiltro !== 'Todas' ? categoriaFiltro : 'Categoría'}
              <ChevronDown size={11} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
            </button>
            {catOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCatOpen(false)} />
                <div className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[180px]">
                  {categoriasDisponibles.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setCategoriaFiltro(cat); setCatOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        cat === categoriaFiltro ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Precio sort */}
          <FilterDropdown
            label="Precio"
            icon={ArrowUpDown}
            value={precioOrden}
            active={precioOrden !== 'ninguno'}
            onChange={v => setPrecioOrden(v as PrecioOrden)}
            options={[
              { value: 'ninguno', label: 'Sin ordenar' },
              { value: 'mayor', label: 'Mayor precio primero' },
              { value: 'menor', label: 'Menor precio primero' },
            ]}
          />

          {/* Margen filter */}
          <FilterDropdown
            label="Margen"
            icon={TrendingUp}
            value={margenFiltro}
            active={margenFiltro !== 'todos'}
            onChange={v => setMargenFiltro(v as MargenFiltro)}
            options={[
              { value: 'todos', label: 'Todos los márgenes' },
              { value: 'alto', label: 'Alto (> 30%)' },
              { value: 'normal', label: 'Normal (15–30%)' },
              { value: 'bajo_margen', label: 'Bajo (< 15%)' },
              { value: 'sin_datos', label: 'Sin datos de costo' },
            ]}
          />

          {/* Ventas filter */}
          <FilterDropdown
            label="Ventas"
            icon={BarChart2}
            value={ventaFiltro}
            active={ventaFiltro !== 'todos'}
            onChange={v => setVentaFiltro(v as VentaFiltro)}
            options={[
              { value: 'todos', label: 'Todos los productos' },
              { value: 'con_ventas', label: 'Con historial de ventas' },
              { value: 'sin_ventas', label: 'Nunca vendidos' },
            ]}
          />

          {/* Clear all */}
          {activeChips.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} /> Limpiar todo
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] text-muted-foreground">Filtros activos:</span>
            {activeChips.map(chip => (
              <button
                key={chip.key}
                onClick={chip.clear}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-medium rounded-full hover:bg-primary/20 transition-colors"
              >
                {chip.label} <X size={10} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Product grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Package size={40} className="opacity-20" />
          <p className="text-sm">No se encontraron productos con los filtros actuales</p>
          {activeChips.length > 0 && (
            <button onClick={clearAll} className="text-xs text-primary hover:underline">
              Limpiar todos los filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(producto => {
            const nivel = stockLevel(producto.stock)
            const margen = producto.precio_compra && producto.precio_compra > 0
              ? (producto.precio - producto.precio_compra) / producto.precio_compra * 100
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
                {/* Header */}
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
                    <button
                      onClick={() => setEditingProducto(producto)}
                      className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                      title="Editar"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeletingProducto(producto)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-muted-foreground hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Price */}
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

                {/* Stock */}
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
                      title="−1"
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      onClick={() => handleAjuste(producto.id, 1)}
                      disabled={isAdjusting}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="+1"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Badge + margen + ventas */}
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${stockBadgeClass[nivel]}`}>
                    {stockLabel[nivel]}
                  </span>
                  <div className="flex items-center gap-2.5">
                    {margen !== null && (
                      <span className={`text-xs font-semibold ${
                        margen > 30 ? 'text-green-600 dark:text-green-400'
                        : margen >= 15 ? 'text-foreground'
                        : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {margen > 0 ? '+' : ''}{margen.toFixed(0)}%
                      </span>
                    )}
                    {producto.total_vendido > 0 && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Flame size={10} className="text-orange-400" />
                        {producto.total_vendido}
                      </span>
                    )}
                  </div>
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

      {/* Footer */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-center pb-2">
          Mostrando {filtered.length} de {productosConStats.length} productos
        </p>
      )}

      {/* ── Edit modal ── */}
      {editingProducto && (
        <ModalEditarProducto
          producto={editingProducto}
          categorias={categorias}
          allProductos={productos}
          onClose={() => setEditingProducto(null)}
          onSaved={updated => {
            setProductos(prev => prev.map(p => p.id === updated.id ? updated : p))
            setEditingProducto(null)
            addToast('Producto actualizado correctamente')
          }}
          onError={msg => addToast(msg, 'error')}
        />
      )}

      {/* ── Delete confirm ── */}
      {deletingProducto && (
        <AlertDialog open onOpenChange={() => setDeletingProducto(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-destructive" />
                ¿Eliminar producto?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de eliminar{' '}
                <span className="font-semibold text-foreground">&ldquo;{deletingProducto.nombre}&rdquo;</span>.{' '}
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(deletingProducto.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <ToastStack toasts={toasts} onClose={id => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}
