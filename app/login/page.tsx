import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Sistema de Ventas',
}

export default function LoginPage() {
  return <LoginForm />
}
