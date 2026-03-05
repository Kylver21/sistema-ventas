'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Barcode, Trash2, ShoppingCart } from 'lucide-react'
import { createVenta } from '@/lib/actions/ventas'

interface ProductoOption {
  id: number
  nombre: string
  precio: number
  stock: number
  codigo_barras?: string | null
}

interface CartItem {
  producto_id: number
  nombre: string
  precio: number
  cantidad: number
}

interface Props {
  productos: ProductoOption[]
  onCreated?: () => void
}

export function ModalNuevaVenta({ productos, onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [clienteNombre, setClienteNombre] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [cantidad, setCantidad] = useState(1)
  const [codigoBarras, setCodigoBarras] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  const resetForm = () => {
    setClienteNombre('')
    setCart([])
    setSelectedProductId('')
    setCantidad(1)
    setCodigoBarras('')
    setServerError(null)
  }

  const addToCart = (productoId: number, qty: number) => {
    const prod = productos.find(p => p.id === productoId)
    if (!prod) return setServerError('Producto no encontrado')

    const totalEnCarrito = cart
      .filter(i => i.producto_id === productoId)
      .reduce((s, i) => s + i.cantidad, 0)

    if (totalEnCarrito + qty > prod.stock) {
      return setServerError(`Stock insuficiente — solo hay ${prod.stock} unidad(es) disponibles`)
    }

    setCart(prev => {
      const existing = prev.find(i => i.producto_id === productoId)
      if (existing) {
        return prev.map(i =>
          i.producto_id === productoId ? { ...i, cantidad: i.cantidad + qty } : i
        )
      }
      return [...prev, { producto_id: productoId, nombre: prod.nombre, precio: prod.precio, cantidad: qty }]
    })
    setServerError(null)
    setSelectedProductId('')
    setCantidad(1)
  }

  const handleAddFromSelect = () => {
    if (!selectedProductId) return setServerError('Selecciona un producto')
    addToCart(Number(selectedProductId), cantidad)
  }

  const buscarPorCodigo = () => {
    if (!codigoBarras.trim()) return
    const found = productos.find(p => p.codigo_barras === codigoBarras.trim())
    if (found) {
      addToCart(found.id, 1)
      setCodigoBarras('')
    } else {
      setServerError(`Código no encontrado: ${codigoBarras}`)
    }
  }

  const removeFromCart = (productoId: number) => {
    setCart(prev => prev.filter(i => i.producto_id !== productoId))
  }

  const updateCantidadCart = (productoId: number, newQty: number) => {
    if (newQty < 1) return removeFromCart(productoId)
    const prod = productos.find(p => p.id === productoId)
    if (prod && newQty > prod.stock) return setServerError(`Stock máximo: ${prod.stock}`)
    setCart(prev => prev.map(i => i.producto_id === productoId ? { ...i, cantidad: newQty } : i))
    setServerError(null)
  }

  const handleSubmit = async () => {
    if (cart.length === 0) return setServerError('Agrega al menos un producto al carrito')
    try {
      setIsSubmitting(true)
      setServerError(null)
      await createVenta({
        cliente_nombre: clienteNombre.trim() || undefined,
        items: cart.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      })
      resetForm()
      setOpen(false)
      router.refresh()
      onCreated?.()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al crear la venta')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
      >
        <Plus size={18} />
        Nueva Venta
      </button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart size={18} /> Nueva Venta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {serverError && (
              <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{serverError}</p>
            )}

            {/* Cliente (opcional) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Cliente <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={clienteNombre}
                onChange={e => setClienteNombre(e.target.value)}
                placeholder="Dejar vacío para 'Consumidor final'"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="border-t border-border" />

            {/* Lector de código de barras */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Barcode size={14} /> Código de barras
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoBarras}
                  onChange={e => { setCodigoBarras(e.target.value); setServerError(null) }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), buscarPorCodigo())}
                  placeholder="Escanea o escribe el código..."
                  className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="button" onClick={buscarPorCodigo}
                  className="px-3 py-2 bg-muted border border-border rounded-md text-sm hover:bg-muted/80 transition-colors">
                  Buscar
                </button>
              </div>
            </div>

            {/* Agregar producto por selector */}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-foreground">Producto</label>
                <select
                  value={selectedProductId}
                  onChange={e => { setSelectedProductId(e.target.value); setServerError(null) }}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleccionar...</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — S/{p.precio.toLocaleString('es-PE')} (stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-20 space-y-1.5">
                <label className="text-sm font-medium text-foreground">Cant.</label>
                <input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={e => setCantidad(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="button"
                onClick={handleAddFromSelect}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:opacity-90 transition-opacity flex items-center gap-1 whitespace-nowrap"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>

            {/* Carrito */}
            {cart.length > 0 && (
              <div className="border border-border rounded-md overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Carrito ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})
                </div>
                <ul className="divide-y divide-border">
                  {cart.map(item => (
                    <li key={item.producto_id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="flex-1 text-sm text-foreground truncate">{item.nombre}</span>
                      <span className="text-xs text-muted-foreground">S/{item.precio.toLocaleString('es-PE')}</span>
                      <input
                        type="number"
                        min={1}
                        value={item.cantidad}
                        onChange={e => updateCantidadCart(item.producto_id, Number(e.target.value))}
                        className="w-14 px-2 py-1 bg-background border border-input rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <span className="text-sm font-semibold text-foreground w-20 text-right">
                        S/{(item.precio * item.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.producto_id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="bg-muted/30 px-4 py-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => { resetForm(); setOpen(false) }}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || cart.length === 0}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : `Confirmar venta${cart.length > 0 ? ` • S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : ''}`}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

