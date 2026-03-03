const ACCESS_KEY = 'nf_access_token'
const REFRESH_KEY = 'nf_refresh_token'
const PROFILE_KEY = 'nf_selected_profile'

export const getAccessToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null

export const getRefreshToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null

export const setTokens = (access: string, refresh: string): void => {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export const setAccessToken = (access: string): void => {
  localStorage.setItem(ACCESS_KEY, access)
}

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(PROFILE_KEY)
}

export const getSelectedProfile = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(PROFILE_KEY) : null

export const setSelectedProfile = (profileId: string): void => {
  localStorage.setItem(PROFILE_KEY, profileId)
}

export const clearSelectedProfile = (): void => {
  localStorage.removeItem(PROFILE_KEY)
}

export const isAuthenticated = (): boolean => !!getAccessToken()
