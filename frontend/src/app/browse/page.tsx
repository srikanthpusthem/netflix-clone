'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { titlesApi, watchHistoryApi, myListApi } from '@/lib/api'
import { getAccessToken, getSelectedProfile } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import TitleCard from '@/components/TitleCard'
import type { Title, WatchHistoryEntry, MyListItem } from '@/lib/types'

const GRADIENTS = [
  'from-blue-900 via-blue-800',
  'from-purple-900 via-purple-800',
  'from-green-900 via-green-800',
  'from-red-950 via-red-900',
]

function heroBg(name: string) {
  let sum = 0
  for (const c of name) sum += c.charCodeAt(0)
  return GRADIENTS[sum % GRADIENTS.length]
}

export default function BrowsePage() {
  const router = useRouter()
  const { selectedProfile, user } = useAuth()

  const [titles, setTitles] = useState<Title[]>([])
  const [continueWatching, setContinueWatching] = useState<WatchHistoryEntry[]>([])
  const [myList, setMyList] = useState<MyListItem[]>([])
  const [myListIds, setMyListIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // Redirect guard
  useEffect(() => {
    if (!getAccessToken()) { router.replace('/login'); return }
    if (!getSelectedProfile()) { router.replace('/profiles'); return }
  }, [router])

  const profileId = selectedProfile?.id ?? getSelectedProfile() ?? ''

  // Load all data in parallel
  useEffect(() => {
    if (!profileId) return
    Promise.all([
      titlesApi.list({ page_size: 50 }),
      watchHistoryApi.continueWatching(profileId, { page_size: 20 }),
      myListApi.list(profileId, { page_size: 20 }),
    ])
      .then(([titlesRes, cwRes, mlRes]) => {
        setTitles(titlesRes.data.items)
        setContinueWatching(cwRes.data.items)
        setMyList(mlRes.data.items)
        setMyListIds(new Set(mlRes.data.items.map((i) => i.title.id)))
      })
      .catch(() => {/* ignore — data may just be empty */})
      .finally(() => setLoading(false))
  }, [profileId])

  // Search filter (client-side on loaded titles)
  const filtered = search.trim()
    ? titles.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : titles

  // Toast helper
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // Play = upsert 0s progress (marks as started)
  const handlePlay = useCallback(async (title: Title) => {
    try {
      await watchHistoryApi.upsert(profileId, title.id, 0)
      setContinueWatching((prev) => {
        const exists = prev.find((e) => e.title.id === title.id)
        if (exists) return prev
        return [{ id: crypto.randomUUID(), profile_id: profileId, progress_seconds: 0, last_watched_at: new Date().toISOString(), title }, ...prev]
      })
      showToast(`Playing "${title.name}"`)
    } catch { /* silent */ }
  }, [profileId])

  const handleAddList = useCallback(async (title: Title) => {
    try {
      const { data } = await myListApi.add(profileId, title.id)
      setMyList((prev) => [data, ...prev])
      setMyListIds((prev) => new Set([...prev, title.id]))
      showToast(`"${title.name}" added to My List`)
    } catch {
      showToast('Already in your list')
    }
  }, [profileId])

  const handleRemoveList = useCallback(async (title: Title) => {
    try {
      await myListApi.remove(profileId, title.id)
      setMyList((prev) => prev.filter((i) => i.title.id !== title.id))
      setMyListIds((prev) => { const s = new Set(prev); s.delete(title.id); return s })
      showToast(`Removed from My List`)
    } catch { /* silent */ }
  }, [profileId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const hero = continueWatching[0]?.title ?? titles[0]

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar onSearch={setSearch} searchValue={search} />

      {/* Hero Banner */}
      {hero && !search && (
        <div className={`relative h-[70vh] bg-gradient-to-br ${heroBg(hero.name)} flex items-end`}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
          <div className="relative z-10 px-8 md:px-16 pb-16 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
              {hero.name}
            </h1>
            {hero.description && (
              <p className="text-zinc-200 text-base md:text-lg mb-6 line-clamp-3 drop-shadow">
                {hero.description}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => handlePlay(hero)}
                className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded hover:bg-zinc-200 transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Play
              </button>
              <button
                onClick={() => myListIds.has(hero.id) ? handleRemoveList(hero) : handleAddList(hero)}
                className="flex items-center gap-2 bg-zinc-500/70 text-white font-bold px-6 py-3 rounded hover:bg-zinc-500 transition backdrop-blur-sm"
              >
                {myListIds.has(hero.id) ? (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> In My List</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg> My List</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content rows */}
      <div className="px-8 md:px-12 pb-20 space-y-10 -mt-4 relative z-10">

        {/* Search results */}
        {search && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              Results for &ldquo;{search}&rdquo;
            </h2>
            {filtered.length === 0 ? (
              <p className="text-zinc-500 text-sm">No titles match your search.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filtered.map((t) => (
                  <TitleCard
                    key={t.id}
                    title={t}
                    inMyList={myListIds.has(t.id)}
                    onPlay={handlePlay}
                    onAddList={handleAddList}
                    onRemoveList={handleRemoveList}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Continue Watching */}
        {!search && continueWatching.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Continue Watching</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {continueWatching.map((entry) => (
                <TitleCard
                  key={entry.id}
                  title={entry.title}
                  progress={entry.progress_seconds}
                  inMyList={myListIds.has(entry.title.id)}
                  onPlay={handlePlay}
                  onAddList={handleAddList}
                  onRemoveList={handleRemoveList}
                />
              ))}
            </div>
          </section>
        )}

        {/* My List */}
        {!search && myList.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">My List</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {myList.map((item) => (
                <TitleCard
                  key={item.id}
                  title={item.title}
                  inMyList={true}
                  onPlay={handlePlay}
                  onAddList={handleAddList}
                  onRemoveList={handleRemoveList}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Titles */}
        {!search && titles.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">All Titles</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {titles.map((t) => (
                <TitleCard
                  key={t.id}
                  title={t}
                  inMyList={myListIds.has(t.id)}
                  onPlay={handlePlay}
                  onAddList={handleAddList}
                  onRemoveList={handleRemoveList}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!search && titles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <svg className="w-16 h-16 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <p className="text-zinc-400 text-lg font-medium">No titles yet</p>
            <p className="text-zinc-600 text-sm mt-1">
              {user?.is_admin
                ? 'Use the API to add titles via POST /api/v1/titles'
                : 'Ask an admin to add content'}
            </p>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-sm font-medium px-5 py-3 rounded-full shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}
    </div>
  )
}
