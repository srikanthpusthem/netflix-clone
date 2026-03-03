'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

interface NavbarProps {
  onSearch: (q: string) => void
  searchValue: string
}

export default function Navbar({ onSearch, searchValue }: NavbarProps) {
  const { user, selectedProfile, logout, clearProfile } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-colors duration-300 ${
        scrolled ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      {/* Left: logo + nav links */}
      <div className="flex items-center gap-8">
        <span className="text-[#E50914] font-black text-2xl tracking-tighter select-none cursor-pointer">
          NETFLIX
        </span>
        <div className="hidden md:flex items-center gap-5 text-sm">
          <button className="text-white font-medium hover:text-zinc-300 transition">Home</button>
          <button className="text-zinc-300 hover:text-white transition">TV Shows</button>
          <button className="text-zinc-300 hover:text-white transition">Movies</button>
          <button className="text-zinc-300 hover:text-white transition">My List</button>
        </div>
      </div>

      {/* Right: search + account */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex items-center gap-2">
          {searchOpen && (
            <input
              autoFocus
              type="text"
              placeholder="Titles, genres…"
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              onBlur={() => { if (!searchValue) setSearchOpen(false) }}
              className="bg-black/80 border border-white/50 text-white text-sm px-3 py-1.5 rounded focus:outline-none w-44 md:w-56"
            />
          )}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-white hover:text-zinc-300 transition"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Account dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center text-sm font-bold text-white">
              {selectedProfile?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <svg
              className={`w-3 h-3 text-white transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              fill="currentColor" viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-black/95 border border-zinc-700 rounded shadow-xl py-2 z-50">
              <div className="px-4 py-2 text-xs text-zinc-400 border-b border-zinc-700 mb-1 truncate">
                {user?.email}
              </div>
              {selectedProfile && (
                <div className="px-4 py-2 text-sm text-zinc-300">
                  Profile: <span className="text-white font-medium">{selectedProfile.name}</span>
                </div>
              )}
              <button
                onClick={() => { setMenuOpen(false); clearProfile() }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
              >
                Switch Profile
              </button>
              <button
                onClick={() => { setMenuOpen(false); logout() }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
