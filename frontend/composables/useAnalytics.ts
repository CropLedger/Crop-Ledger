export const useAnalytics = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  const headers = computed(() => ({
    Authorization: `Bearer ${token.value}`,
  }))

  const getStats = async () => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/analytics/stats`, {
        headers: headers.value,
      })
      return data
    } catch (error: any) {
      console.error('Failed to fetch analytics stats:', error)
      throw error
    }
  }

  const getForecast = async (params: { cropType: string; region?: string }) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/forecast`, {
        headers: headers.value,
        params,
      })
      return data
    } catch (error: any) {
      console.error('Failed to fetch forecast:', error)
      throw error
    }
  }

  return {
    getStats,
    getForecast,
  }
}
