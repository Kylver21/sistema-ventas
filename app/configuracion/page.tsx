'use client'

import { useState } from 'react'
import { Save, Eye, EyeOff, LogOut } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function ConfiguracionPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    empresa: 'Mi Negocio',
    industria: 'Retail',
    phone: '+34 123 456 789',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumbs />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu perfil y preferencias del negocio</p>
      </div>

      {/* Profile Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Información de Perfil</h2>
          
          {/* Avatar */}
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-3xl text-primary font-bold">JP</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cambiar foto de perfil</p>
              <button className="mt-1 text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                Subir imagen
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Empresa</label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Industria</label>
              <select
                name="industria"
                value={formData.industria}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer"
              >
                <option>Retail</option>
                <option>Servicios</option>
                <option>Manufactura</option>
                <option>Tecnología</option>
                <option>Otro</option>
              </select>
            </div>

            <button className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
              <Save size={18} />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Seguridad</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Contraseña Actual</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Nueva Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
            />
          </div>

          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
            Actualizar Contraseña
          </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Preferencias</h2>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-sm text-foreground">Recibir notificaciones por email</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-sm text-foreground">Reportes automáticos semanales</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" />
            <span className="text-sm text-foreground">Alertas de stock bajo</span>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-4">Zona de Peligro</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-red-700 mb-2">Cerrar sesión en todos los dispositivos</p>
            <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
              <LogOut size={18} />
              Cerrar todas las sesiones
            </button>
          </div>

          <div className="border-t border-red-200 pt-4">
            <p className="text-sm text-red-700 mb-2">Eliminar cuenta</p>
            <p className="text-xs text-red-600 mb-3">Esta acción no se puede deshacer. Se eliminarán todos tus datos.</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              Eliminar mi cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
