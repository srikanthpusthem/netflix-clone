export interface User {
  id: string
  email: string
  is_active: boolean
  is_admin: boolean
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  name: string
  avatar_url: string | null
  is_kids_profile: boolean
  created_at: string
}

export interface Title {
  id: string
  name: string
  description: string | null
  release_year: number | null
  duration_minutes: number | null
  genre: string | null
  thumbnail_url: string | null
  video_url: string | null
  created_at: string
}

export interface WatchHistoryEntry {
  id: string
  profile_id: string
  progress_seconds: number
  last_watched_at: string
  title: Title
}

export interface MyListItem {
  id: string
  profile_id: string
  created_at: string
  title: Title
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface ApiError {
  detail: string
}
