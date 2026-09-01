export const useVaults = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  const headers = computed(() => ({
    Authorization: `Bearer ${token.value}`,
  }))

  const list = async () => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/vaults`, {
        headers: headers.value,
      })
      return data
    } catch (error: any) {
      console.error('Failed to fetch vaults:', error)
      throw error
    }
  }

  const getById = async (id: string) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/vaults/${id}`, {
        headers: headers.value,
      })
      return data
    } catch (error: any) {
      console.error('Failed to fetch vault:', error)
      throw error
    }
  }

  const deposit = async (vaultId: string, amount: number, stellarTxId?: string) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/vaults/${vaultId}/deposits`, {
        method: 'POST',
        headers: headers.value,
        body: { amount, stellarTxId },
      })
      return data
    } catch (error: any) {
      console.error('Failed to deposit to vault:', error)
      throw error
    }
  }

  const getDeposits = async (vaultId: string) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/vaults/${vaultId}/deposits`, {
        headers: headers.value,
      })
      return data
    } catch (error: any) {
      console.error('Failed to fetch deposits:', error)
      throw error
    }
  }

  return {
    list,
    getById,
    deposit,
    getDeposits,
  }
}
