export const useAuth = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')
  const user = useCookie('auth_user')

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/auth/login`, {
        method: 'POST',
        body: credentials,
      })
      
      if (data.token) {
        token.value = data.token
        user.value = data.user
      }
      
      return data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await $fetch(`${config.public.apiBase}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      token.value = null
      user.value = null
    }
  }

  const register = async (userData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    type: string
  }) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/auth/register`, {
        method: 'POST',
        body: userData,
      })
      
      return data
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    register,
  }
}
