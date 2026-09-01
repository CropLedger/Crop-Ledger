export const useContracts = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  const headers = computed(() => ({
    Authorization: `Bearer ${token.value}`,
  }))

  const list = async (params?: { limit?: number; offset?: number }) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/contracts`, {
        headers: headers.value,
        params,
      })
      return data
    } catch (error: any) {
      console.error('Failed to fetch contracts:', error)
      throw error
    }
  }

  const getById = async (id: string) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/contracts/${id}`, {
        headers: headers.value,
      })
      return data
    } catch (error: any) {
      console.error('Failed to fetch contract:', error)
      throw error
    }
  }

  const create = async (contractData: {
    contractNumber: string
    buyerId: string
    sellerId: string
    cropType: string
    quantity: number
    unitPrice: number
    totalPrice: number
    deliveryDate: string
    deliveryLocation?: string
  }) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/contracts`, {
        method: 'POST',
        headers: headers.value,
        body: contractData,
      })
      return data
    } catch (error: any) {
      console.error('Failed to create contract:', error)
      throw error
    }
  }

  const update = async (id: string, contractData: Partial<any>) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/contracts/${id}`, {
        method: 'PATCH',
        headers: headers.value,
        body: contractData,
      })
      return data
    } catch (error: any) {
      console.error('Failed to update contract:', error)
      throw error
    }
  }

  const deleteContract = async (id: string) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/api/v1/contracts/${id}`, {
        method: 'DELETE',
        headers: headers.value,
      })
      return data
    } catch (error: any) {
      console.error('Failed to delete contract:', error)
      throw error
    }
  }

  return {
    list,
    getById,
    create,
    update,
    delete: deleteContract,
  }
}
