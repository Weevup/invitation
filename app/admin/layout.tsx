import { AdminSidebar } from '@/components/admin/sidebar'
import { SonnerToaster } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from '@/components/session-provider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
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
