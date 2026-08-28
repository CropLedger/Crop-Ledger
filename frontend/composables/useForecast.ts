import type { Forecast, HealthStatus, HistoricalForecast } from '~/types/api'

export const useForecast = () => {
  const { apiFetch } = useApi()

  const generate = (input: { cropType: string; region: string; timeHorizon: number }): Promise<Forecast> =>
    apiFetch<Forecast>('/api/v1/forecast/generate', {
      method: 'POST',
      body: input,
    })

  const historical = (query: { cropType?: string; region?: string } = {}): Promise<HistoricalForecast> =>
    apiFetch<HistoricalForecast>('/api/v1/forecast/historical', { query })

  const health = (): Promise<HealthStatus> => apiFetch<HealthStatus>('/health')

  return { generate, historical, health }
}
