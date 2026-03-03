'use client'

import { useState } from 'react'
import type { Title } from '@/lib/types'

// Deterministic gradient per title
const GRADIENTS = [
  'from-blue-900 to-blue-700',
  'from-purple-900 to-purple-700',
  'from-green-900 to-green-700',
  'from-red-900 to-red-700',
  'from-yellow-900 to-yellow-700',
  'from-pink-900 to-pink-700',
  'from-teal-900 to-teal-700',
  'from-indigo-900 to-indigo-700',
]

function gradientFor(name: string) {
  let sum = 0
  for (const c of name) sum += c.charCodeAt(0)
  return GRADIENTS[sum % GRADIENTS.length]
}

function formatDuration(mins: number | null) {
  if (!mins) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

interface TitleCardProps {
  title: Title
  progress?: number          // seconds watched (for continue watching row)
  onPlay?: (title: Title) => void
  onAddList?: (title: Title) => void
  onRemoveList?: (title: Title) => void
  inMyList?: boolean
}

export default function TitleCard({
  title,
  progress,
  onPlay,
  onAddList,
  onRemoveList,
  inMyList = false,
}: TitleCardProps) {
  const [hovered, setHovered] = useState(false)
  const duration = title.duration_minutes ?? 0
  const progressPct = duration > 0 && progress ? Math.min((progress / (duration * 60)) * 100, 100) : 0

  return (
    <div
      className="relative flex-shrink-0 w-56 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div
        className={`w-full h-32 rounded-md bg-gradient-to-br ${gradientFor(title.name)} relative overflow-hidden transition-transform duration-200 ${hovered ? 'scale-110 z-10 shadow-2xl rounded-b-none' : ''}`}
      >
        {title.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={title.thumbnail_url}
            alt={title.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-3 card-gradient">
            <span className="text-white font-semibold text-sm leading-tight line-clamp-2">
              {title.name}
            </span>
          </div>
        )}

        {/* Progress bar */}
        {progressPct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
            <div
              className="h-full bg-[#E50914]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Hover detail panel */}
      {hovered && (
        <div className="absolute left-0 right-0 bg-zinc-800 rounded-b-md px-3 py-3 z-10 shadow-2xl scale-110 origin-top">
          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => onPlay?.(title)}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-zinc-200 transition flex-shrink-0"
              title="Play"
            >
              <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </button>

            {inMyList ? (
              <button
                onClick={() => onRemoveList?.(title)}
                className="w-8 h-8 border-2 border-zinc-400 rounded-full flex items-center justify-center hover:border-white transition"
                title="Remove from My List"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => onAddList?.(title)}
                className="w-8 h-8 border-2 border-zinc-400 rounded-full flex items-center justify-center hover:border-white transition"
                title="Add to My List"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>

          {/* Meta */}
          <p className="text-white text-xs font-semibold truncate">{title.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {title.release_year && (
              <span className="text-zinc-400 text-xs">{title.release_year}</span>
            )}
            {formatDuration(title.duration_minutes) && (
              <span className="text-zinc-400 text-xs">{formatDuration(title.duration_minutes)}</span>
            )}
            {title.genre && (
              <span className="text-zinc-400 text-xs">{title.genre}</span>
            )}
          </div>
          {progress !== undefined && duration > 0 && (
            <p className="text-zinc-500 text-xs mt-1">
              {Math.round(progressPct)}% watched
            </p>
          )}
        </div>
      )}
    </div>
  )
}
