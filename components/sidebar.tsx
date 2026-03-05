'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, BarChart3, ShoppingCart, Package, FolderOpen, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/ventas', label: 'Ventas', icon: ShoppingCart },
  { href: '/productos', label: 'Productos', icon: Package },
  { href: '/categorias', label: 'Categorías', icon: FolderOpen },
  { href: '/reportes', label: 'Reportes', icon: FileText },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        isOpen ? 'w-64' : 'w-20'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {isOpen && <h1 className="text-lg font-bold text-sidebar-foreground">Dashboard</h1>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-sidebar-accent rounded-md transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-md transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          {isOpen && (
            <div className="text-xs text-sidebar-foreground/60">
              © 2026 Sistema de Ventas
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-sidebar border-b border-sidebar-border p-4 z-50 flex items-center justify-between">
        <h1 className="text-lg font-bold text-sidebar-foreground">Dashboard</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-sidebar-accent rounded-md transition-colors"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden fixed top-16 left-0 right-0 bg-sidebar border-b border-sidebar-border p-4 space-y-2 z-40">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
