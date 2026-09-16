/**
 * Central API Client for NEXUS Backend
 * Base URL: http://localhost:8000
 */
import { Case, Entity, Evidence, NetworkGraphData, CrimePattern, ThreatAlert, MetricData, TimelineEvent } from '../types'
import { auth } from '../firebase'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Retrieves the current Firebase ID token for authenticated requests.
 * Tokens are never logged.
 */
async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      if (token) {
        return { Authorization: `Bearer ${token}` }
      }
    }
  } catch {
    // Fail silently without exposing credentials
  }
  return {}
}

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

export interface ExtractedEntityMatch {
  name: string
  type: string
  matched_text?: string
  matchedText?: string
  indicator_type?: string
  indicatorType?: string
}

export interface ExtractedData {
  summary: string
  entities: ExtractedEntityMatch[]
  phone_numbers?: string[]
  phoneNumbers?: string[]
  vehicle_numbers?: string[]
  vehicleNumbers?: string[]
  currency_amounts?: string[]
  currencyAmounts?: string[]
  extraction_tags?: string[]
  extractionTags?: string[]
  extraction_engine?: string
  extractionEngine?: string
}

export interface FileDetails {
  filename: string
  size_bytes?: number
  sizeBytes?: number
  size_formatted?: string
  sizeFormatted?: string
  format: string
  mime_type?: string | null
  mimeType?: string | null
}

export interface UploadResponse {
  id: string
  evidence_number?: string
  evidenceNumber?: string
  case_id?: string
  caseId?: string
  case_name?: string
  caseName?: string
  title: string
  hash_sha256?: string
  hashSHA256?: string
  file_details?: FileDetails
  fileDetails?: FileDetails
  extraction: ExtractedData
  review_status?: string
  reviewStatus?: string
  dataset_label?: string
  datasetLabel?: string
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
  const authHeaders = await getAuthHeader()
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
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

  updateCase: async (caseId: string, caseUpdate: Partial<Case>): Promise<Case> => {
    return request<Case>(`/api/cases/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(caseUpdate),
    })
  },

  updateCaseStatus: async (caseId: string, newStatus: string): Promise<Case> => {
    return request<Case>(`/api/cases/${caseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    })
  },

  assignCaseInvestigator: async (caseId: string, leadInvestigator: string): Promise<Case> => {
    return request<Case>(`/api/cases/${caseId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ leadInvestigator }),
    })
  },

  getCaseEntities: async (caseId: string): Promise<Entity[]> => {
    return request<Entity[]>(`/api/cases/${caseId}/entities`)
  },

  linkEntityToCase: async (caseId: string, entityId: string, roleInCase?: string): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>(`/api/cases/${caseId}/entities`, {
      method: 'POST',
      body: JSON.stringify({ entityId, roleInCase }),
    })
  },

  unlinkEntityFromCase: async (caseId: string, entityId: string): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>(`/api/cases/${caseId}/entities/${entityId}`, {
      method: 'DELETE',
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

  getEntities: async (params?: { city?: string; type?: string; search?: string } | string): Promise<Entity[]> => {
    const query = new URLSearchParams()
    if (typeof params === 'string') {
      if (params) query.append('city', params)
    } else if (params) {
      if (params.city) query.append('city', params.city)
      if (params.type) query.append('type', params.type)
      if (params.search) query.append('search', params.search)
    }
    const qs = query.toString()
    return request<Entity[]>(`/api/entities${qs ? `?${qs}` : ''}`)
  },

  createEntity: async (entityData: Partial<Entity>): Promise<Entity> => {
    return request<Entity>('/api/entities', {
      method: 'POST',
      body: JSON.stringify(entityData),
    })
  },

  updateEntity: async (entityId: string, entityUpdate: Partial<Entity>): Promise<Entity> => {
    return request<Entity>(`/api/entities/${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(entityUpdate),
    })
  },

  deleteEntity: async (entityId: string): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>(`/api/entities/${entityId}`, {
      method: 'DELETE',
    })
  },

  getEntityCases: async (entityId: string): Promise<Case[]> => {
    return request<Case[]>(`/api/entities/${entityId}/cases`)
  },

  // 5. Insights
  getInsights: async (caseId: string): Promise<CaseInsightsResponse> => {
    return request<CaseInsightsResponse>(`/api/insights/${caseId}`)
  },

  // 6. Evidence Upload & Ingestion (Multipart Form-Data)
  uploadEvidence: async (formData: FormData): Promise<UploadResponse> => {
    const url = `${API_BASE_URL}/api/upload`
    const authHeaders = await getAuthHeader()
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...authHeaders,
        },
        body: formData,
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
          errorDetail || `Upload failed with status ${response.status}`,
          response.status
        )
      }

      return (await response.json()) as UploadResponse
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
  },

  // 7. Evidence Retrieval
  getEvidenceList: async (caseId?: string): Promise<Evidence[]> => {
    const qs = caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''
    return request<Evidence[]>(`/api/evidence${qs}`)
  },

  getEvidence: async (evidenceId: string): Promise<Evidence> => {
    return request<Evidence>(`/api/evidence/${evidenceId}`)
  },

  // 8. Operational Timeline
  getTimeline: async (params?: { caseId?: string; category?: string; entityId?: string; search?: string }): Promise<TimelineEvent[]> => {
    const query = new URLSearchParams()
    if (params?.caseId) query.append('case_id', params.caseId)
    if (params?.category && params.category !== 'ALL') query.append('category', params.category)
    if (params?.entityId && params.entityId !== 'ALL') query.append('entity_id', params.entityId)
    if (params?.search) query.append('search', params.search)

    const qs = query.toString()
    return request<TimelineEvent[]>(`/api/timeline${qs ? `?${qs}` : ''}`)
  },

  createTimelineEvent: async (eventData: Partial<TimelineEvent>): Promise<TimelineEvent> => {
    return request<TimelineEvent>('/api/timeline', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  },

  // 9. Structured Data Ingestion
  ingestCDR: async (records: unknown[], caseId: string = 'case-sih-01'): Promise<unknown> => {
    return request(`/api/ingest/cdr?caseId=${encodeURIComponent(caseId)}`, {
      method: 'POST',
      body: JSON.stringify(records),
    })
  },

  ingestFASTag: async (records: unknown[], caseId: string = 'case-sih-01'): Promise<unknown> => {
    return request(`/api/ingest/fastag?caseId=${encodeURIComponent(caseId)}`, {
      method: 'POST',
      body: JSON.stringify(records),
    })
  },

  getIngestionStats: async (): Promise<unknown> => {
    return request('/api/ingest/stats')
  }
}
