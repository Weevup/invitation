"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function TutorielPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to help page with quickstart tab
    router.replace('/admin/help')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#009197] mx-auto mb-4" />
        <p className="text-[#004645]">Redirection vers le guide de démarrage...</p>
      </div>
    </div>
  )
}
