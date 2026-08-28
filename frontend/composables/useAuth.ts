import type { Account, LoginResponse, RegisterInput, RegisterResponse } from '~/types/api'

export const useAuth = () => {
  const { apiFetch } = useApi()
  const { token, refreshToken } = useApiTokens()
  const user = useCookie<Account | null>('auth_user', { sameSite: 'lax' })

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const data = await apiFetch<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: credentials,
    })

    token.value = data.token
    refreshToken.value = data.refreshToken
    user.value = data.user

    return data
  }

  const register = async (input: RegisterInput): Promise<RegisterResponse> =>
    apiFetch<RegisterResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: input,
    })

  const logout = async () => {
    try {
      await apiFetch('/api/v1/auth/logout', { method: 'POST' })
    } finally {
      token.value = null
      refreshToken.value = null
      user.value = null
    }
  }

  const fetchProfile = async (): Promise<Account> => {
    const account = await apiFetch<Account>('/api/v1/accounts/me')
    user.value = account
    return account
  }

  const updateProfile = async (input: Partial<Account>): Promise<Account> => {
    const account = await apiFetch<Account>('/api/v1/accounts/me', {
      method: 'PATCH',
      body: input,
    })
    user.value = account
    return account
  }

  const listAccounts = async (): Promise<Account[]> => apiFetch<Account[]>('/api/v1/accounts')

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    listAccounts,
  }
}
