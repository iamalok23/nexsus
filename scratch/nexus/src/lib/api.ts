/**
 * Central API Client for NEXUS Backend
 * Base URL: http://localhost:8000
 */
import { Case, Entity, NetworkGraphData, CrimePattern, ThreatAlert, MetricData } from '../types'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface CaseInsightsResponse {
  caseId: string
  caseTitle: string
  summary: string
  patterns: CrimePattern[]
  alerts: ThreatAlert[]
  metrics: MetricData[]
  dataset_label: string
}

export interface HealthResponse {
  status: string
  service: string
  version: string
  timestamp: string
  dataset: string
  active_cases: number
}

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorDetail = ''
      try {
        const errorJson = await response.json()
        errorDetail = errorJson.error?.message || errorJson.detail || JSON.stringify(errorJson)
      } catch {
        errorDetail = response.statusText
      }
      throw new ApiError(
        errorDetail || `API request failed with status ${response.status}`,
        response.status
      )
    }

    return (await response.json()) as T
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err
    }
    const message = err instanceof Error ? err.message : 'Network error or backend unreachable'
    throw new ApiError(
      `Unable to connect to NEXUS Backend at ${API_BASE_URL}. (${message})`,
      0
    )
  }
}

export const api = {
  // 1. Health Check
  getHealth: async (): Promise<HealthResponse> => {
    return request<HealthResponse>('/health')
  },

  // 2. Cases
  getCases: async (params?: { status?: string; priority?: string; search?: string }): Promise<Case[]> => {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'ALL') query.append('status', params.status)
    if (params?.priority && params.priority !== 'ALL') query.append('priority', params.priority)
    if (params?.search) query.append('search', params.search)

    const qs = query.toString()
    return request<Case[]>(`/api/cases${qs ? `?${qs}` : ''}`)
  },

  getCaseById: async (caseId: string): Promise<Case> => {
    return request<Case>(`/api/cases/${caseId}`)
  },

  createCase: async (caseData: {
    title: string
    description: string
    codeName: string
    priority?: string
    leadInvestigator: string
    agency?: string
    jurisdiction?: string
  }): Promise<Case> => {
    return request<Case>('/api/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    })
  },

  // 3. Network Graph (Powered by NetworkX)
  getNetwork: async (caseId: string, filterType?: string): Promise<NetworkGraphData> => {
    const qs = filterType ? `?filter_type=${encodeURIComponent(filterType)}` : ''
    return request<NetworkGraphData>(`/api/network/${caseId}${qs}`)
  },

  // 4. Entities
  getEntity: async (entityId: string): Promise<Entity> => {
    return request<Entity>(`/api/entities/${entityId}`)
  },

  getEntities: async (city?: string): Promise<Entity[]> => {
    const qs = city ? `?city=${encodeURIComponent(city)}` : ''
    return request<Entity[]>(`/api/entities${qs}`)
  },

  // 5. Insights
  getInsights: async (caseId: string): Promise<CaseInsightsResponse> => {
    return request<CaseInsightsResponse>(`/api/insights/${caseId}`)
  },
}
