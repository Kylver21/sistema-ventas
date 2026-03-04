'use client'

import { Bell, User } from 'lucide-react'

export function Header() {
  return (
    <header className="hidden md:flex items-center justify-between p-6 bg-background border-b border-border">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bienvenido</h1>
        <p className="text-sm text-muted-foreground">Gestiona tu negocio desde aquí</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-muted rounded-md transition-colors">
          <Bell size={20} className="text-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-md transition-colors">
          <User size={20} className="text-foreground" />
        </button>
      </div>
    </header>
  )
}
