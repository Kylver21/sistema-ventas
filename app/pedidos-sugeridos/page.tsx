import Link from 'next/link'
import { AlertTriangle, ArrowLeft, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumbs } from '@/components/breadcrumbs'

async function getProductosStockBajo() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('productos')
    .select('id, nombre, stock, precio_compra, categorias(nombre)')
    .eq('activo', true)
    .lt('stock', 10)
    .order('stock', { ascending: true })
  return (data ?? []) as {
    id: number
    nombre: string
    stock: number
    precio_compra: number | null
    categorias: { nombre: string } | null
  }[]
}

const STOCK_OBJETIVO = 20

export default async function PedidosSugeridosPage() {
  const productos = await getProductosStockBajo()

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Pedidos Sugeridos a Proveedores</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-6">
            Productos con stock bajo (&lt; 10 unidades) — se sugiere reponer hasta {STOCK_OBJETIVO} unidades.
          </p>
        </div>
        <Link
          href="/productos"
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
        >
          <ShoppingBag size={14} /> Gestionar productos
        </Link>
      </div>

      {/* Table / List */}
      {productos.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <p className="text-base font-semibold text-green-600 dark:text-green-400 mb-1">
            ¡Sin pedidos pendientes!
          </p>
          <p className="text-sm text-muted-foreground">
            Todos los productos tienen stock suficiente.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/40">
            <p className="col-span-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">#</p>
            <p className="col-span-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Producto</p>
            <p className="col-span-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Stock actual</p>
            <p className="col-span-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Cantidad a pedir</p>
            <p className="col-span-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Costo estimado</p>
            <p className="col-span-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Estado</p>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-border">
            {productos.map((p, i) => {
              const cantidadSugerida = Math.max(STOCK_OBJETIVO - p.stock, 1)
              const costoEstimado =
                p.precio_compra != null
                  ? `S/ ${(cantidadSugerida * p.precio_compra).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                  : '—'
              const esAgotado = p.stock === 0

              return (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-muted/30 transition-colors"
                >
                  {/* # */}
                  <p className="col-span-1 text-sm text-muted-foreground font-medium">{i + 1}</p>

                  {/* Producto */}
                  <div className="col-span-4">
                    <p className="text-sm font-semibold text-foreground">{p.nombre}</p>
                    {p.categorias && (
                      <p className="text-xs text-muted-foreground">{p.categorias.nombre}</p>
                    )}
                  </div>

                  {/* Stock actual */}
                  <div className="col-span-2 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      esAgotado
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {esAgotado ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          Agotado
                        </>
                      ) : `${p.stock} uds`}
                    </span>
                  </div>

                  {/* Cantidad sugerida */}
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-bold text-foreground">{cantidadSugerida}</span>
                    <span className="text-xs text-muted-foreground ml-1">uds</span>
                  </div>

                  {/* Costo estimado */}
                  <p className="col-span-2 text-sm font-semibold text-foreground text-right">{costoEstimado}</p>

                  {/* Estado */}
                  <div className="col-span-1 flex justify-center">
                    <AlertTriangle
                      size={16}
                      className={esAgotado ? 'text-red-500' : 'text-orange-500'}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer summary */}
          {productos.some(p => p.precio_compra != null) && (
            <div className="px-5 py-3 border-t border-border bg-muted/40 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {productos.length} producto{productos.length !== 1 ? 's' : ''} necesitan reposición
              </p>
              <p className="text-sm font-bold text-foreground">
                Total estimado:{' '}
                <span className="text-primary">
                  S/{' '}
                  {productos
                    .filter(p => p.precio_compra != null)
                    .reduce((sum, p) => {
                      const cant = Math.max(STOCK_OBJETIVO - p.stock, 1)
                      return sum + cant * (p.precio_compra ?? 0)
                    }, 0)
                    .toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
