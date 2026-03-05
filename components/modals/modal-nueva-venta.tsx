'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Minus, Trash2, ShoppingCart, CheckCircle, Printer } from 'lucide-react'
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

interface VoucherData {
  id: number
  fecha: string
  items: CartItem[]
  total: number
}

interface Props {
  productos: ProductoOption[]
  onCreated?: () => void
}

type Step = 'form' | 'voucher'

export function ModalNuevaVenta({ productos, onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [cantidad, setCantidad] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voucher, setVoucher] = useState<VoucherData | null>(null)
  const router = useRouter()

  const selectedProduct = productos.find(p => p.id === Number(selectedProductId))
  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  // Stock disponible descontando lo que ya está en el carrito
  const stockDisponible = selectedProduct
    ? selectedProduct.stock - (cart.find(i => i.producto_id === selectedProduct.id)?.cantidad ?? 0)
    : 0

  const resetForm = () => {
    setCart([])
    setSelectedProductId('')
    setCantidad(1)
    setServerError(null)
    setStep('form')
    setVoucher(null)
  }

  const addToCart = () => {
    if (!selectedProduct) return setServerError('Selecciona un producto')
    const enCarrito = cart.find(i => i.producto_id === selectedProduct.id)?.cantidad ?? 0
    if (enCarrito + cantidad > selectedProduct.stock) {
      return setServerError(`Stock insuficiente â€” solo hay ${selectedProduct.stock} disponibles`)
    }
    setCart(prev => {
      const existing = prev.find(i => i.producto_id === selectedProduct.id)
      if (existing) {
        return prev.map(i =>
          i.producto_id === selectedProduct.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        )
      }
      return [...prev, {
        producto_id: selectedProduct.id,
        nombre: selectedProduct.nombre,
        precio: selectedProduct.precio,
        cantidad,
      }]
    })
    setServerError(null)
    setSelectedProductId('')
    setCantidad(1)
  }

  const updateQtyCart = (productoId: number, delta: number) => {
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
    setServerError(null)
  }

  const handleSubmit = async () => {
    if (cart.length === 0) return setServerError('Agrega al menos un producto al pedido')
    try {
      setIsSubmitting(true)
      setServerError(null)
      const result = await createVenta({
        items: cart.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      })
      const now = new Date()
      setVoucher({
        id: result.id,
        fecha: now.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }),
        items: [...cart],
        total,
      })
      setStep('voucher')
      router.refresh()
      onCreated?.()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al crear la venta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => { resetForm(); setOpen(false) }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
      >
        <Plus size={18} /> Nueva Venta
      </button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); setOpen(v) }}>
        <DialogContent className="max-w-md">

          {/* â”€â”€ PASO 1: FORMULARIO â”€â”€ */}
          {step === 'form' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingCart size={18} /> Nueva Venta
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {serverError && (
                  <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                    {serverError}
                  </p>
                )}

                {/* Selector de producto */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Producto</label>
                  <select
                    value={selectedProductId}
                    onChange={e => {
                      setSelectedProductId(e.target.value)
                      setServerError(null)
                      setCantidad(1)
                    }}
                    className="w-full px-3 py-2.5 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">â€” Seleccionar producto â€”</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock === 0}>
                        {p.nombre}{p.stock === 0 ? ' (sin stock)' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Info en tiempo real del producto seleccionado */}
                  {selectedProduct && (
                    <div className="flex items-center justify-between bg-muted/60 rounded-md px-4 py-2.5">
                      <span className="text-base font-bold text-foreground">
                        S/ {selectedProduct.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        stockDisponible > 5
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : stockDisponible > 0
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {stockDisponible > 0 ? `${stockDisponible} en stock` : 'Sin stock disponible'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Cantidad + Agregar */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-input rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setCantidad(q => Math.max(1, q - 1))}
                      className="px-3 py-2.5 hover:bg-muted transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold select-none">{cantidad}</span>
                    <button
                      type="button"
                      onClick={() => setCantidad(q => Math.min(stockDisponible || 99, q + 1))}
                      disabled={!selectedProduct || cantidad >= stockDisponible}
                      className="px-3 py-2.5 hover:bg-muted transition-colors disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={addToCart}
                    disabled={!selectedProduct || stockDisponible === 0}
                    className="flex-1 py-2.5 bg-secondary text-secondary-foreground rounded-md text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    + Agregar al pedido
                  </button>
                </div>

                {/* Carrito */}
                {cart.length > 0 && (
                  <div className="border border-border rounded-md overflow-hidden">
                    <div className="bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Pedido â€” {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
                    </div>
                    <ul className="divide-y divide-border">
                      {cart.map(item => (
                        <li key={item.producto_id} className="flex items-center gap-3 px-4 py-3">
                          <span className="flex-1 text-sm text-foreground truncate">{item.nombre}</span>
                          <div className="flex items-center border border-input rounded overflow-hidden text-sm">
                            <button
                              type="button"
                              onClick={() => updateQtyCart(item.producto_id, -1)}
                              className="px-2 py-1 hover:bg-muted transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 font-semibold select-none">{item.cantidad}</span>
                            <button
                              type="button"
                              onClick={() => updateQtyCart(item.producto_id, 1)}
                              disabled={item.cantidad >= (productos.find(p => p.id === item.producto_id)?.stock ?? 0)}
                              className="px-2 py-1 hover:bg-muted transition-colors disabled:opacity-40"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-foreground w-16 text-right">
                            S/{(item.precio * item.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCart(prev => prev.filter(i => i.producto_id !== item.producto_id))}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-muted/30 px-4 py-3 flex justify-between items-center border-t border-border">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="text-xl font-bold text-foreground">
                        S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={cart.length === 0 || isSubmitting}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Procesando...'
                    : `Confirmar venta · S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                </button>
              </div>
            </>
          )}

          {/* â”€â”€ PASO 2: VOUCHER â”€â”€ */}
          {step === 'voucher' && voucher && (
            <div className="py-2 space-y-5">
              {/* Confirmación visual */}
              <div className="text-center space-y-1">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={30} />
                  </div>
                </div>
                <h2 className="text-lg font-bold text-foreground">¡Venta Confirmada!</h2>
                <p className="text-sm text-muted-foreground">Venta #{voucher.id} · {voucher.fecha}</p>
              </div>

              {/* Voucher / boleta */}
              <div className="border border-border rounded-md overflow-hidden print-voucher">
                <div className="bg-muted/50 px-4 py-2 text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Boleta de Venta</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Producto</th>
                      <th className="text-center px-2 py-2 font-medium text-muted-foreground">Cant.</th>
                      <th className="text-right px-2 py-2 font-medium text-muted-foreground">P.U.</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {voucher.items.map(item => (
                      <tr key={item.producto_id}>
                        <td className="px-4 py-2.5 text-foreground">{item.nombre}</td>
                        <td className="px-2 py-2.5 text-center text-muted-foreground">{item.cantidad}</td>
                        <td className="px-2 py-2.5 text-right text-muted-foreground">
                          S/ {item.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                          S/ {(item.precio * item.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/30">
                      <td colSpan={3} className="px-4 py-3 font-bold text-foreground">TOTAL</td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-foreground">
                        S/ {voucher.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <div className="px-4 py-2 border-t border-border text-center text-xs text-muted-foreground">
                  Cliente: Consumidor final
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <Printer size={15} /> Imprimir
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Nueva venta
                </button>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </>
  )
}

