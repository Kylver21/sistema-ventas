'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const breadcrumbLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'ventas': 'Ventas',
  'productos': 'Productos',
  'categorias': 'Categorías',
  'reportes': 'Reportes',
  'configuracion': 'Configuración',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = breadcrumbLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    const isLast = index === segments.length - 1

    return { href, label, isLast }
  })

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Inicio
      </Link>
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={16} className="text-muted-foreground" />
          {breadcrumb.isLast ? (
            <span className="text-foreground font-medium">{breadcrumb.label}</span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
