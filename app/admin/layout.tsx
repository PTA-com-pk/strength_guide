'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getUser, isAdmin } from '@/lib/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check admin access on mount and route changes
    const user = getUser()
    if (!user || !isAdmin()) {
      router.push(`/login?redirect=${pathname}`)
    }
  }, [router, pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}

