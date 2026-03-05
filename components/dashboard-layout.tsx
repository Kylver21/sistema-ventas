import { Sidebar } from './sidebar'
import { Header } from './header'
import { getCurrentProfile } from '@/lib/actions/auth'

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <Header profile={profile} />
        <main className="flex-1 p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}

