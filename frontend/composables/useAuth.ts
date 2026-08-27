export const useAuth = () => {
  const token = useCookie('auth_token')
  const user = useCookie('auth_user')

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials: { email: string; password: string }) => {
    const { data } = await $fetch('/api/v1/auth/login', {
      method: 'POST',
      body: credentials,
    })
    
    token.value = data.token
    user.value = data.user
    
    return data
  }

  const logout = async () => {
    await $fetch('/api/v1/auth/logout', {
      method: 'POST',
    })
    
    token.value = null
    user.value = null
  }

  const register = async (userData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    type: string
  }) => {
    const { data } = await $fetch('/api/v1/auth/register', {
      method: 'POST',
      body: userData,
    })
    
    return data
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
