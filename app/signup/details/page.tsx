'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This page is deprecated — redirect to dashboard which handles everything
export default function SignupDetailsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#888' }}>
      Redirecting...
    </div>
  )
}
