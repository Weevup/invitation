import { AdminSidebar } from '@/components/admin/sidebar'
import { SonnerToaster } from '@/components/ui/sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
      <SonnerToaster />
    </div>
  )
}
