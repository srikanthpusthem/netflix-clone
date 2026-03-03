'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { profilesApi } from '@/lib/api'
import { getAccessToken } from '@/lib/auth'
import type { Profile } from '@/lib/types'
import { AxiosError } from 'axios'

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-green-600',
  'bg-yellow-600',
  'bg-pink-600',
]

export default function ProfilesPage() {
  const router = useRouter()
  const { selectProfile, user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [isKids, setIsKids] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login')
      return
    }
    profilesApi.list()
      .then(({ data }) => setProfiles(data))
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false))
  }, [router])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const { data } = await profilesApi.create(newName.trim(), isKids)
      setProfiles((prev) => [...prev, data])
      setNewName('')
      setIsKids(false)
      setShowForm(false)
    } catch (err) {
      const msg = (err as AxiosError<{ detail: string }>).response?.data?.detail
      setError(msg ?? 'Could not create profile.')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <span className="absolute top-6 left-8 text-[#E50914] font-black text-3xl tracking-tighter select-none">
        NETFLIX
      </span>

      <h1 className="text-4xl md:text-5xl font-semibold text-white mb-12">
        Who&apos;s watching?
      </h1>

      <div className="flex flex-wrap gap-6 justify-center mb-10">
        {profiles.map((profile, i) => (
          <button
            key={profile.id}
            onClick={() => selectProfile(profile)}
            className="flex flex-col items-center gap-3 group"
          >
            <div
              className={`w-28 h-28 rounded-md flex items-center justify-center text-4xl font-bold text-white transition-all duration-200 group-hover:ring-4 group-hover:ring-white group-hover:scale-105 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-zinc-400 text-sm group-hover:text-white transition-colors">
              {profile.name}
              {profile.is_kids_profile && (
                <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                  KIDS
                </span>
              )}
            </span>
          </button>
        ))}

        {/* Add profile */}
        {profiles.length < 5 && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-28 h-28 rounded-md border-2 border-zinc-600 flex items-center justify-center text-5xl text-zinc-500 group-hover:border-white group-hover:text-white transition-all duration-200 group-hover:scale-105">
              +
            </div>
            <span className="text-zinc-400 text-sm group-hover:text-white transition-colors">
              Add Profile
            </span>
          </button>
        )}
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="w-full max-w-sm bg-zinc-900 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">New Profile</h2>
          {error && <p className="text-[#E87C03] text-sm">{error}</p>}
          <input
            autoFocus
            type="text"
            placeholder="Profile name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="w-full bg-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isKids}
              onChange={(e) => setIsKids(e.target.checked)}
              className="w-4 h-4 accent-[#E50914]"
            />
            <span className="text-zinc-300 text-sm">Kids profile</span>
          </label>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="flex-1 bg-white text-black font-semibold py-2 rounded hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="flex-1 border border-zinc-600 text-zinc-300 font-semibold py-2 rounded hover:border-white hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {profiles.length === 0 && !showForm && (
        <p className="text-zinc-500 text-sm mt-4">No profiles yet. Add one above.</p>
      )}
    </div>
  )
}
