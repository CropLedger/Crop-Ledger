export const useBatches = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  const headers = computed(() => ({
    Authorization: `Bearer ${token.value}`,
  }))

  const list = async (params?: { farmerId?: string; contractId?: string; status?: string; cropType?: string }) => {
    return $fetch(`${config.public.apiBase}/api/v1/batches`, {
      headers: headers.value,
      params,
    })
  }

  const getById = async (id: string) => {
    return $fetch(`${config.public.apiBase}/api/v1/batches/${id}`, {
      headers: headers.value,
    })
  }

  const create = async (batchData: {
    farmerId: string
    cropType: string
    quantityKg: number
    harvestDate: string
    originLocation: string
    varietyName?: string
    qualityGrade?: string
    destinationLocation?: string
    contractId?: string
  }) => {
    return $fetch(`${config.public.apiBase}/api/v1/batches`, {
      method: 'POST',
      headers: headers.value,
      body: batchData,
    })
  }

  const getEvents = async (batchId: string) => {
    return $fetch(`${config.public.apiBase}/api/v1/batches/${batchId}/events`, {
      headers: headers.value,
    })
  }

  const recordEvent = async (batchId: string, eventData: {
    eventType: string
    actorId: string
    location?: string
    temperature?: number
    humidity?: number
    notes?: string
  }) => {
    return $fetch(`${config.public.apiBase}/api/v1/batches/${batchId}/events`, {
      method: 'POST',
      headers: headers.value,
      body: eventData,
    })
  }

  return { list, getById, create, getEvents, recordEvent }
}
