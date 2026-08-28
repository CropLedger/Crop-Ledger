import type { NitroFetchOptions } from 'nitropack'
import type { AuthTokens } from '~/types/api'

export const useApiTokens = () => ({
  token: useCookie<string | null>('auth_token', { sameSite: 'lax' }),
  refreshToken: useCookie<string | null>('refresh_token', { sameSite: 'lax' }),
})

/**
 * Thin wrapper around $fetch that targets the CropLedger API, attaches the
 * bearer token and transparently retries once after refreshing an expired one.
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  const { token, refreshToken } = useApiTokens()
  const baseURL = config.public.apiBase as string

  const renewTokens = async (): Promise<boolean> => {
    if (!refreshToken.value) return false
    try {
      const tokens = await $fetch<AuthTokens>('/api/v1/auth/refresh', {
        baseURL,
        method: 'POST',
        body: { refreshToken: refreshToken.value },
      })
      token.value = tokens.token
      refreshToken.value = tokens.refreshToken
      return true
    } catch {
      token.value = null
      refreshToken.value = null
      return false
    }
  }

  const apiFetch = async <T>(path: string, options: NitroFetchOptions<string> = {}): Promise<T> => {
    const call = () =>
      $fetch<T>(path, {
        ...options,
        baseURL,
        headers: {
          ...(options.headers as Record<string, string> | undefined),
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        },
      })

    try {
      return await call()
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status
      if (status === 401 && (await renewTokens())) {
        return await call()
      }
      throw error
    }
  }

  return { apiFetch, baseURL }
}

export const apiErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { data?: { error?: string | { message?: string } } }).data?.error
  if (typeof data === 'string') return data
  if (data && typeof data.message === 'string') return data.message
  return fallback
}
