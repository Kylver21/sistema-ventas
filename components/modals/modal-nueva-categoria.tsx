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

const categoriaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
})

type CategoriaForm = z.infer<typeof categoriaSchema>

interface Props {
  onCreated?: (categoria: CategoriaForm & { productos: number; ventas: number }) => void
}

export function ModalNuevaCategoria({ onCreated }: Props) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaForm>({
    resolver: zodResolver(categoriaSchema),
  })

  const onSubmit = async (data: CategoriaForm) => {
    onCreated?.({ ...data, productos: 0, ventas: 0 })
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
        Nueva Categoría
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nombre de la categoría</label>
              <input
                {...register('nombre')}
                placeholder="Ej: Impresoras"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Descripción <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <textarea
                {...register('descripcion')}
                placeholder="Describe brevemente esta categoría..."
                rows={3}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
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
                {isSubmitting ? 'Guardando...' : 'Crear Categoría'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
