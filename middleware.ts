import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (imágenes optimizadas)
     * - favicon.ico, archivos públicos
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
