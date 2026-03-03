'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken, getSelectedProfile } from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login')
    } else if (!getSelectedProfile()) {
      router.replace('/profiles')
    } else {
      router.replace('/browse')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
