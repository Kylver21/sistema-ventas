import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-8xl font-black text-muted-foreground/30">404</h1>
        <h2 className="text-2xl font-bold text-foreground">Página no encontrada</h2>
        <p className="text-muted-foreground max-w-sm">
          La página que buscas no existe o fue movida.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
      >
        Volver al Dashboard
      </Link>
    </div>
  )
}
