'use client'

import { Bell, Sun, Moon, Monitor } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { LogoutButton } from './logout-button'
import type { Profile } from '@/lib/supabase/types'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Resumen general del negocio' },
  '/ventas': { title: 'Ventas', subtitle: 'Gestiona tus ventas y transacciones' },
  '/productos': { title: 'Productos', subtitle: 'Catálogo y control de inventario' },
  '/categorias': { title: 'Categorías', subtitle: 'Organiza tus productos por categoría' },
  '/reportes': { title: 'Reportes', subtitle: 'Análisis y generación de reportes' },
  '/configuracion': { title: 'Configuración', subtitle: 'Perfil y preferencias' },
}

interface HeaderProps {
  profile?: Profile | null
}

export function Header({ profile }: HeaderProps) {
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

  const initials = profile?.nombre
    ? profile.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

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
        {/* User info */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">{initials}</span>
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-foreground leading-tight">{profile?.nombre ?? 'Usuario'}</p>

          </div>
        </div>
        {/* Logout */}
        <LogoutButton />
      </div>
    </header>
  )
}

