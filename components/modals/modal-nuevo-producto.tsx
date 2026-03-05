'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { createProducto } from '@/lib/actions/productos'

const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  categoria_id: z.coerce.number().int().min(1, 'Selecciona una categoría'),
  precio: z.coerce.number().positive('El precio de venta debe ser mayor a 0'),
  precio_compra: z.coerce.number().nonnegative('No puede ser negativo').optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  codigo_barras: z.string().optional().or(z.literal('')),
})

type ProductoForm = z.infer<typeof productoSchema>

interface CategoriaOption {
  id: number
  nombre: string
}

interface Props {
  categorias: CategoriaOption[]
  onCreated?: () => void
}

export function ModalNuevoProducto({ categorias, onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()

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
    try {
      setServerError(null)
      await createProducto({
        nombre: data.nombre,
        categoria_id: data.categoria_id,
        precio: data.precio,
        precio_compra: data.precio_compra || undefined,
        stock: data.stock,
        codigo_barras: data.codigo_barras || undefined,
      })
      reset()
      setOpen(false)
      router.refresh()
      onCreated?.()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al crear el producto')
    }
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {serverError && (
              <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{serverError}</p>
            )}
            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nombre del producto</label>
              <input
                {...register('nombre')}
                placeholder="Ej: Arroz extra bolsa 1kg"
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
                {...register('categoria_id')}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Seleccionar categoría...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              {errors.categoria_id && (
                <p className="text-xs text-destructive">{errors.categoria_id.message}</p>
              )}
            </div>

            {/* Precio venta, Precio compra y Stock */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Precio venta (S/)</label>
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
                <label className="text-sm font-medium text-foreground">Costo (S/) <span className="text-muted-foreground font-normal">(opcional)</span></label>
                <input
                  {...register('precio_compra')}
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
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

            {/* Código de barras */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Código de barras <span className="text-muted-foreground font-normal">(opcional)</span></label>
              <input
                {...register('codigo_barras')}
                placeholder="Ej: 7501055300120"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
              {errors.codigo_barras && (
                <p className="text-xs text-destructive">{errors.codigo_barras.message}</p>
              )}
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
