import axios, { AxiosError } from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from './auth'
import type {
  TokenResponse,
  User,
  Profile,
  Title,
  WatchHistoryEntry,
  MyListItem,
  PaginatedResponse,
} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

const client = axios.create({ baseURL: BASE_URL })

// ── Attach access token to every request ───────────────────────────────────
client.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── On 401: try refresh once, then redirect to login ──────────────────────
client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean }
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true
      const refresh = getRefreshToken()
      if (refresh) {
        try {
          const { data } = await axios.post<{ access_token: string }>(
            `${BASE_URL}/auth/refresh`,
            { refresh_token: refresh },
          )
          setAccessToken(data.access_token)
          if (original) original.headers!['Authorization'] = `Bearer ${data.access_token}`
          return client(original!)
        } catch {
          /* fall through */
        }
      }
      clearTokens()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string) =>
    client.post<User>('/auth/register', { email, password }),

  login: (email: string, password: string) =>
    client.post<TokenResponse>('/auth/login', { email, password }),

  me: () => client.get<User>('/auth/me'),
}

// ── Profiles ───────────────────────────────────────────────────────────────
export const profilesApi = {
  list: () => client.get<Profile[]>('/profiles'),

  create: (name: string, isKids = false, avatarUrl?: string) =>
    client.post<Profile>('/profiles', {
      name,
      is_kids_profile: isKids,
      avatar_url: avatarUrl ?? null,
    }),

  delete: (profileId: string) =>
    client.delete(`/profiles/${profileId}`),
}

// ── Titles ─────────────────────────────────────────────────────────────────
export const titlesApi = {
  list: (params?: { page?: number; page_size?: number; search?: string }) =>
    client.get<PaginatedResponse<Title>>('/titles', { params }),

  get: (titleId: string) => client.get<Title>(`/titles/${titleId}`),

  create: (payload: Partial<Title>) => client.post<Title>('/titles', payload),
}

// ── Watch History ──────────────────────────────────────────────────────────
export const watchHistoryApi = {
  upsert: (profileId: string, titleId: string, progressSeconds: number) =>
    client.put(`/profiles/${profileId}/watch-history`, {
      title_id: titleId,
      progress_seconds: progressSeconds,
    }),

  continueWatching: (profileId: string, params?: { page?: number; page_size?: number }) =>
    client.get<PaginatedResponse<WatchHistoryEntry>>(
      `/profiles/${profileId}/watch-history/continue-watching`,
      { params },
    ),
}

// ── My List ────────────────────────────────────────────────────────────────
export const myListApi = {
  list: (profileId: string, params?: { page?: number; page_size?: number }) =>
    client.get<PaginatedResponse<MyListItem>>(
      `/profiles/${profileId}/my-list`,
      { params },
    ),

  add: (profileId: string, titleId: string) =>
    client.post<MyListItem>(`/profiles/${profileId}/my-list`, { title_id: titleId }),

  remove: (profileId: string, titleId: string) =>
    client.delete(`/profiles/${profileId}/my-list/${titleId}`),
}

export default client
