'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, X, Minus, Plus, Trash2, ArrowLeft,
  CheckCircle, Printer, ShoppingCart,
} from 'lucide-react'
import { createVenta } from '@/lib/actions/ventas'

export interface ProductoPOS {
  id: number
  nombre: string
  precio: number
  stock: number
  codigo_barras?: string | null
  categoria_id?: number | null
  categorias?: { nombre: string } | null
}

interface CartItem {
  producto_id: number
  nombre: string
  precio: number
  cantidad: number
}

interface VoucherData {
  id: number
  fecha: string
  items: CartItem[]
  total: number
  metodoPago: string
  vuelto: number
}

type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Yape/Plin'
type ViewState = 'pos' | 'pago' | 'voucher'

const BILLETES = [5, 10, 20, 50, 100, 200]
const METODOS: MetodoPago[] = ['Efectivo', 'Tarjeta', 'Yape/Plin']

interface Props {
  productos: ProductoPOS[]
  onClose: () => void
  onCreated?: () => void
}

export function POSView({ productos, onClose, onCreated }: Props) {
  const [view, setView] = useState<ViewState>('pos')
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState<string>('Todos')
  const [metodo, setMetodo] = useState<MetodoPago>('Efectivo')
  const [efectivo, setEfectivo] = useState<string>('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voucher, setVoucher] = useState<VoucherData | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const total = cart.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const efectivoNum = parseFloat(efectivo) || 0
  const vuelto = Math.max(0, efectivoNum - total)
  const totalItems = cart.reduce((s, i) => s + i.cantidad, 0)

  const categorias = useMemo(() => {
    const set = new Set<string>()
    productos.forEach(p => set.add(p.categorias?.nombre ?? 'General'))
    return ['Todos', ...Array.from(set).sort()]
  }, [productos])

  const filteredProductos = useMemo(() => {
    const q = search.toLowerCase()
    return productos.filter(p => {
      const matchSearch = !search
        || p.nombre.toLowerCase().includes(q)
        || (p.codigo_barras ?? '').includes(search)
      const matchCat =
        categoriaActiva === 'Todos' ||
        (p.categorias?.nombre ?? 'General') === categoriaActiva
      return matchSearch && matchCat
    })
  }, [productos, search, categoriaActiva])

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  const addToCart = (prod: ProductoPOS) => {
    const enCarrito = cart.find(i => i.producto_id === prod.id)?.cantidad ?? 0
    if (enCarrito >= prod.stock) return
    setCart(prev => {
      const existing = prev.find(i => i.producto_id === prod.id)
      if (existing) {
        return prev.map(i =>
          i.producto_id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      }
      return [...prev, { producto_id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 }]
    })
  }

  const updateQty = (productoId: number, delta: number) => {
    const prod = productos.find(p => p.id === productoId)
    setCart(prev =>
      prev
        .map(i => {
          if (i.producto_id !== productoId) return i
          const next = i.cantidad + delta
          if (next > (prod?.stock ?? 0)) return i
          return { ...i, cantidad: next }
        })
        .filter(i => i.cantidad > 0)
    )
  }

  const handleCobrar = () => {
    if (cart.length === 0) return
    setMetodo('Efectivo')
    setEfectivo('')
    setServerError(null)
    setView('pago')
  }

  const handleConfirmarPago = async () => {
    if (metodo === 'Efectivo' && (!efectivo || efectivoNum < total)) {
      setServerError('El monto recibido es menor al total')
      return
    }
    try {
      setIsSubmitting(true)
      setServerError(null)
      const result = await createVenta({
        items: cart.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      })
      setVoucher({
        id: result.id,
        fecha: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }),
        items: [...cart],
        total,
        metodoPago: metodo,
        vuelto: metodo === 'Efectivo' ? vuelto : 0,
      })
      setView('voucher')
      router.refresh()
      onCreated?.()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al procesar la venta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNuevaVenta = () => {
    setCart([])
    setSearch('')
    setCategoriaActiva('Todos')
    setVoucher(null)
    setServerError(null)
    setView('pos')
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  const [mobileTab, setMobileTab] = useState<'productos' | 'carrito'>('productos')

  // When an item is added on mobile, flash the cart tab hint
  const prevCartLen = useRef(cart.length)
  useEffect(() => {
    if (cart.length > prevCartLen.current && mobileTab === 'productos') {
      // stay on products, just let the badge update
    }
    prevCartLen.current = cart.length
  }, [cart.length, mobileTab])

  // ── Shared: product browser panels ──────────────────────────────────────────
  const ProductBrowser = (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Search bar */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar producto o código de barras..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="shrink-0 px-4 pb-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategoriaActiva(cat); setSearch('') }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                cat === categoriaActiva
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredProductos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
            <Search size={36} className="opacity-20" />
            <p className="text-sm">Sin resultados{search ? ` para "${search}"` : ''}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProductos.map(prod => {
              const cantEnCarrito = cart.find(i => i.producto_id === prod.id)?.cantidad ?? 0
              const disponible = prod.stock - cantEnCarrito
              const agotado = disponible <= 0
              return (
                <button
                  key={prod.id}
                  onClick={() => {
                    addToCart(prod)
                  }}
                  disabled={agotado}
                  className={`relative text-left p-3 rounded-xl border-2 transition-all select-none active:scale-[0.97] ${
                    agotado
                      ? 'border-border bg-muted/20 opacity-40 cursor-not-allowed'
                      : cantEnCarrito > 0
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  {cantEnCarrito > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[20px] h-5 px-1 bg-primary text-primary-foreground text-[11px] font-bold rounded-full flex items-center justify-center">
                      {cantEnCarrito}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-foreground leading-tight mb-2 pr-6 line-clamp-2">
                    {prod.nombre}
                  </p>
                  <p className="text-base font-bold text-primary">
                    S/ {prod.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-[11px] mt-0.5 font-medium ${
                    disponible > 10
                      ? 'text-green-600 dark:text-green-400'
                      : disponible > 0
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-500'
                  }`}>
                    {disponible > 0 ? `${disponible} en stock` : 'Agotado'}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  // ── Shared: cart panel content ───────────────────────────────────────────────
  const CartContent = (
    <>
      {/* Cart header */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border">
        <h2 className="font-bold text-foreground flex items-center gap-2 text-sm">
          <ShoppingCart size={15} />
          Pedido
          {totalItems > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {totalItems}
            </span>
          )}
        </h2>
        {cart.length > 0 && (
          <button
            onClick={() => setCart([])}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Vaciar
          </button>
        )}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center text-muted-foreground">
            <ShoppingCart size={36} className="opacity-15 mb-1" />
            <p className="text-sm font-medium">Pedido vacío</p>
            <p className="text-xs leading-relaxed">
              Toca cualquier producto para agregarlo
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {cart.map(item => {
              const maxStock = productos.find(p => p.id === item.producto_id)?.stock ?? item.cantidad
              return (
                <li key={item.producto_id} className="px-5 py-3">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="flex-1 text-sm text-foreground leading-snug">{item.nombre}</span>
                    <button
                      onClick={() => setCart(p => p.filter(i => i.producto_id !== item.producto_id))}
                      className="shrink-0 mt-0.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-input rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item.producto_id, -1)}
                        className="px-3 py-2 hover:bg-muted transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-9 text-center text-sm font-bold select-none">{item.cantidad}</span>
                      <button
                        onClick={() => updateQty(item.producto_id, 1)}
                        disabled={item.cantidad >= maxStock}
                        className="px-3 py-2 hover:bg-muted transition-colors disabled:opacity-40"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        S/ {(item.precio * item.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                      {item.cantidad > 1 && (
                        <p className="text-[11px] text-muted-foreground">
                          S/ {item.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })} c/u
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Totals + COBRAR */}
      <div className="shrink-0 border-t border-border p-4 space-y-3">
        <div className="flex justify-between items-center py-1">
          <span className="font-bold text-foreground text-base">TOTAL</span>
          <span className="text-2xl font-bold text-foreground">
            S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <button
          onClick={handleCobrar}
          disabled={cart.length === 0}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          COBRAR
        </button>
      </div>
    </>
  )

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <header className="shrink-0 flex items-center justify-between px-4 md:px-6 h-14 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-bold text-foreground">Punto de Venta</h1>
        </div>
        <span className="text-sm text-muted-foreground hidden md:block">
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        {/* Mobile: cart badge button in header */}
        <button
          onClick={() => setMobileTab(t => t === 'carrito' ? 'productos' : 'carrito')}
          className="md:hidden relative p-2 rounded-lg bg-muted text-foreground"
        >
          <ShoppingCart size={18} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </header>

      {/* ── DESKTOP: two-column layout ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* LEFT: product browser */}
        {ProductBrowser}

        {/* RIGHT: cart */}
        <aside className="w-72 xl:w-80 shrink-0 flex flex-col border-l border-border bg-card">
          {CartContent}
        </aside>
      </div>

      {/* ── MOBILE: tabbed layout ── */}
      <div className="flex md:hidden flex-1 overflow-hidden">
        {mobileTab === 'productos' ? (
          <>
            {/* Product browser fills full width */}
            {ProductBrowser}
            {/* Sticky bottom bar: total + go to cart */}
            {cart.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card px-4 py-3 flex items-center gap-3 shadow-lg">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{totalItems} producto{totalItems !== 1 ? 's' : ''}</p>
                  <p className="text-lg font-bold text-foreground leading-tight">
                    S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => setMobileTab('carrito')}
                  className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <ShoppingCart size={15} />
                  Ver pedido
                </button>
              </div>
            )}
          </>
        ) : (
          /* Cart view full-screen on mobile */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Back to products */}
            <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <button
                onClick={() => setMobileTab('productos')}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={15} /> Seguir agregando
              </button>
            </div>
            {CartContent}
          </div>
        )}
      </div>

      {/* ── PAYMENT OVERLAY ── */}
      {view === 'pago' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Cobrar</h3>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total a cobrar</p>
                <p className="text-2xl font-bold text-foreground">
                  S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {serverError && (
                <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                  {serverError}
                </p>
              )}

              {/* Method selector */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Método de pago
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {METODOS.map(m => (
                    <button
                      key={m}
                      onClick={() => { setMetodo(m); setEfectivo(''); setServerError(null) }}
                      className={`py-4 rounded-xl text-sm font-semibold border-2 transition-all leading-tight ${
                        metodo === m
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/50'
                      }`}
                    >
                      {m === 'Yape/Plin' ? (
                        <><span>Yape /</span><br /><span>Plin</span></>
                      ) : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Efectivo section */}
              {metodo === 'Efectivo' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Billetes rápidos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BILLETES.map(b => (
                      <button
                        key={b}
                        onClick={() => { setEfectivo(String(b)); setServerError(null) }}
                        className={`px-3.5 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                          Number(efectivo) === b
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-muted text-foreground hover:border-primary/40'
                        }`}
                      >
                        S/{b}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.10"
                    value={efectivo}
                    onChange={e => { setEfectivo(e.target.value); setServerError(null) }}
                    placeholder={`S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                    className="w-full px-4 py-3 bg-background border-2 border-input rounded-xl text-lg font-bold text-center focus:outline-none focus:border-primary"
                    autoFocus
                  />
                  {efectivoNum > 0 && efectivoNum >= total && (
                    <div className="flex justify-between items-center bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">Vuelto</span>
                      <span className="text-xl font-bold text-green-700 dark:text-green-400">
                        S/ {vuelto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {efectivoNum > 0 && efectivoNum < total && (
                    <p className="text-xs text-destructive text-center">
                      Faltan S/ {(total - efectivoNum).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              )}

              {(metodo === 'Tarjeta' || metodo === 'Yape/Plin') && (
                <div className="flex items-center gap-3 py-4 px-4 bg-muted/50 rounded-xl text-sm text-muted-foreground">
                  <CheckCircle size={16} className="text-green-500 shrink-0" />
                  <span>
                    Confirma el cobro de{' '}
                    <strong className="text-foreground">
                      S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </strong>{' '}
                    por {metodo}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => { setView('pos'); setServerError(null) }}
                className="px-5 py-3 bg-muted text-muted-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleConfirmarPago}
                disabled={
                  isSubmitting ||
                  (metodo === 'Efectivo' && (!efectivo || efectivoNum < total))
                }
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar pago'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VOUCHER OVERLAY ── */}
      {view === 'voucher' && voucher && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 flex flex-col max-h-[88vh] overflow-hidden">

            {/* Success header */}
            <div className="shrink-0 p-6 text-center border-b border-border">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={34} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground">¡Venta completada!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                #{voucher.id} · {voucher.fecha} · {voucher.metodoPago}
              </p>
              {voucher.metodoPago === 'Efectivo' && voucher.vuelto > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Vuelto:</span>
                  <span className="text-lg font-bold text-green-700 dark:text-green-400">
                    S/ {voucher.vuelto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Boleta table */}
            <div className="flex-1 overflow-y-auto">
              <div className="mx-5 my-4 border border-border rounded-xl overflow-hidden">
                <div className="bg-muted/40 px-4 py-2 text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Boleta de Venta</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Producto</th>
                      <th className="text-center px-2 py-2 text-xs font-medium text-muted-foreground">Cant</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {voucher.items.map(item => (
                      <tr key={item.producto_id}>
                        <td className="px-4 py-2.5 text-foreground">{item.nombre}</td>
                        <td className="px-2 py-2.5 text-center text-muted-foreground">{item.cantidad}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                          S/ {(item.precio * item.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/30">
                      <td colSpan={2} className="px-4 py-3 font-bold text-foreground text-sm">TOTAL</td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        S/ {voucher.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <div className="px-4 py-2 border-t border-border text-center text-xs text-muted-foreground">
                  Cliente: Consumidor final
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="shrink-0 flex gap-2 px-5 pb-5">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-3 bg-muted text-muted-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                <Printer size={15} /> Imprimir
              </button>
              <button
                onClick={handleNuevaVenta}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Nueva venta
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 bg-muted text-muted-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
