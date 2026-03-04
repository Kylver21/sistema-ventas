'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, X } from 'lucide-react'

const ventaSchema = z.object({
  cliente: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  producto: z.string().min(1, 'Selecciona un producto'),
  cantidad: z.coerce.number().int().min(1, 'La cantidad mínima es 1'),
  estado: z.enum(['Completado', 'Pendiente', 'Cancelado']),
})

type VentaForm = z.infer<typeof ventaSchema>

const productosDisponibles = [
  { id: 1, nombre: 'Laptop Pro', precio: 4796 },
  { id: 2, nombre: 'Mouse Inalámbrico', precio: 89 },
  { id: 3, nombre: 'Teclado Mecánico', precio: 549 },
  { id: 4, nombre: 'Monitor 27"', precio: 1289 },
  { id: 5, nombre: 'Hub USB', precio: 92 },
  { id: 6, nombre: 'Webcam HD', precio: 291 },
]

interface Props {
  onCreated?: (venta: VentaForm & { total: string; fecha: string }) => void
}

export function ModalNuevaVenta({ onCreated }: Props) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VentaForm>({
    resolver: zodResolver(ventaSchema),
    defaultValues: { estado: 'Pendiente', cantidad: 1 },
  })

  const productoSeleccionado = productosDisponibles.find(
    (p) => p.nombre === watch('producto')
  )
  const total = productoSeleccionado
    ? productoSeleccionado.precio * (watch('cantidad') || 1)
    : 0

  const onSubmit = async (data: VentaForm) => {
    const nuevaVenta = {
      ...data,
      total: `S/ ${total.toLocaleString('es-PE')}`,
      fecha: new Date().toISOString().split('T')[0],
    }
    onCreated?.(nuevaVenta)
    reset()
    setOpen(false)
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Venta</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Cliente */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Cliente</label>
              <input
                {...register('cliente')}
                placeholder="Nombre del cliente"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.cliente && (
                <p className="text-xs text-destructive">{errors.cliente.message}</p>
              )}
            </div>

            {/* Producto */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Producto</label>
              <select
                {...register('producto')}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Seleccionar producto...</option>
                {productosDisponibles.map((p) => (
                  <option key={p.id} value={p.nombre}>
                    {p.nombre} — S/ {p.precio.toLocaleString('es-PE')}
                  </option>
                ))}
              </select>
              {errors.producto && (
                <p className="text-xs text-destructive">{errors.producto.message}</p>
              )}
            </div>

            {/* Cantidad + Total preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Cantidad</label>
                <input
                  {...register('cantidad')}
                  type="number"
                  min={1}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.cantidad && (
                  <p className="text-xs text-destructive">{errors.cantidad.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Total estimado</label>
                <div className="px-3 py-2 bg-muted border border-border rounded-md text-sm font-semibold text-foreground">
                  S/ {total.toLocaleString('es-PE')}
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Estado</label>
              <select
                {...register('estado')}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => { reset(); setOpen(false) }}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Crear Venta'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
