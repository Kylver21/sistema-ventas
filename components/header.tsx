'use client'

import { Bell, User, Sun, Moon, Monitor } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Resumen general del negocio' },
  '/ventas': { title: 'Ventas', subtitle: 'Gestiona tus ventas y transacciones' },
  '/productos': { title: 'Productos', subtitle: 'Catálogo y control de inventario' },
  '/categorias': { title: 'Categorías', subtitle: 'Organiza tus productos por categoría' },
  '/reportes': { title: 'Reportes', subtitle: 'Análisis y generación de reportes' },
  '/configuracion': { title: 'Configuración', subtitle: 'Perfil y preferencias' },
}

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const page = pageTitles[pathname] ?? { title: 'Dashboard', subtitle: 'Gestiona tu negocio' }

  const themeIcons = [
    { value: 'light', icon: Sun, label: 'Claro' },
    { value: 'dark', icon: Moon, label: 'Oscuro' },
    { value: 'system', icon: Monitor, label: 'Sistema' },
  ]

  return (
    <header className="hidden md:flex items-center justify-between px-6 py-4 bg-background border-b border-border">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{page.title}</h1>
        <p className="text-sm text-muted-foreground">{page.subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        {mounted && (
          <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
            {themeIcons.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className={`p-1.5 rounded-md transition-colors ${
                  theme === value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        )}
        {/* Notifications */}
        <button className="relative p-2 hover:bg-muted rounded-md transition-colors">
          <Bell size={20} className="text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
        {/* User */}
        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-md transition-colors">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <User size={14} className="text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Juan P.</span>
        </button>
      </div>
    </header>
  )
}

