'use client'

import { logout } from '@/lib/actions/auth'
import { LogOut, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await logout()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      title="Cerrar sesión"
      className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 text-muted-foreground rounded-md transition-colors text-sm disabled:opacity-50"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
      <span className="hidden sm:inline">Salir</span>
    </button>
  )
}
