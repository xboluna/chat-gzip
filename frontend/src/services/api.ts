import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

export type HealthResponse = {
  status: string
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health')
  return data
}
