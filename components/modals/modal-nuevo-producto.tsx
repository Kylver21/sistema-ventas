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
import { Plus } from 'lucide-react'

const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  categoria: z.string().min(1, 'Selecciona una categoría'),
  precio: z.coerce.number().positive('El precio debe ser mayor a 0'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
})

type ProductoForm = z.infer<typeof productoSchema>

const categoriasDisponibles = ['Computadoras', 'Periféricos', 'Monitores', 'Accesorios']

interface Props {
  onCreated?: (producto: ProductoForm & { ventas: number }) => void
}

export function ModalNuevoProducto({ onCreated }: Props) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductoForm>({
    resolver: zodResolver(productoSchema),
    defaultValues: { stock: 0 },
  })

  const onSubmit = async (data: ProductoForm) => {
    onCreated?.({ ...data, ventas: 0 })
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
        Nuevo Producto
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nombre del producto</label>
              <input
                {...register('nombre')}
                placeholder="Ej: Laptop Pro X"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>

            {/* Categoría */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Categoría</label>
              <select
                {...register('categoria')}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Seleccionar categoría...</option>
                {categoriasDisponibles.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.categoria && (
                <p className="text-xs text-destructive">{errors.categoria.message}</p>
              )}
            </div>

            {/* Precio y Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Precio (S/)</label>
                <input
                  {...register('precio')}
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.precio && (
                  <p className="text-xs text-destructive">{errors.precio.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Stock inicial</label>
                <input
                  {...register('stock')}
                  type="number"
                  min={0}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">{errors.stock.message}</p>
                )}
              </div>
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
                {isSubmitting ? 'Guardando...' : 'Crear Producto'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
