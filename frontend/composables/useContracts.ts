import type {
  Contract,
  ContractCreateInput,
  ContractListResponse,
  ContractUpdateInput,
} from '~/types/api'

export const useContracts = () => {
  const { apiFetch } = useApi()

  const list = (status?: string): Promise<ContractListResponse> =>
    apiFetch<ContractListResponse>('/api/v1/contracts', {
      query: status ? { status } : undefined,
    })

  const getById = (id: string): Promise<Contract> => apiFetch<Contract>(`/api/v1/contracts/${id}`)

  const create = (input: ContractCreateInput): Promise<{ contractId: string }> =>
    apiFetch<{ contractId: string }>('/api/v1/contracts', {
      method: 'POST',
      body: input,
    })

  const update = (id: string, input: ContractUpdateInput): Promise<Contract> =>
    apiFetch<Contract>(`/api/v1/contracts/${id}`, {
      method: 'PATCH',
      body: input,
    })

  const remove = async (id: string): Promise<void> => {
    await apiFetch(`/api/v1/contracts/${id}`, { method: 'DELETE' })
  }

  return { list, getById, create, update, remove }
}
