'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getSelectedProfile,
  setSelectedProfile,
  clearSelectedProfile,
} from '@/lib/auth'
import type { User, Profile } from '@/lib/types'

interface AuthContextValue {
  user: User | null
  selectedProfile: Profile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  selectProfile: (profile: Profile) => void
  clearProfile: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [selectedProfile, setProfileState] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }
    authApi.me()
      .then(({ data }) => setUser(data))
      .catch(() => clearTokens())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password)
    setTokens(data.access_token, data.refresh_token)
    const { data: me } = await authApi.me()
    setUser(me)
    router.push('/profiles')
  }, [router])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    setProfileState(null)
    router.push('/login')
  }, [router])

  const selectProfile = useCallback((profile: Profile) => {
    setSelectedProfile(profile.id)
    setProfileState(profile)
    router.push('/browse')
  }, [router])

  const clearProfile = useCallback(() => {
    clearSelectedProfile()
    setProfileState(null)
    router.push('/profiles')
  }, [router])

  return (
    <AuthContext.Provider
      value={{ user, selectedProfile, loading, login, logout, selectProfile, clearProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
