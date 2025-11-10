import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { SonnerToaster } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from '@/components/session-provider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Vérification d'authentification côté serveur
  const session = await auth()

  // Rediriger vers login si non authentifié
  if (!session?.user) {
    redirect('/admin/login')
  }

  // Vérifier que l'utilisateur a le rôle ADMIN
  if (session.user.role !== 'ADMIN') {
    redirect('/?error=forbidden')
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar user={session.user} />
        <div className="pl-64">
          <main className="p-8">
            {children}
          </main>
        </div>
        <SonnerToaster />
        <Toaster />
      </div>
    </SessionProvider>
  )
}
