export type EntityType = 
  | 'suspect' 
  | 'organization' 
  | 'shell_company' 
  | 'vehicle' 
  | 'burner_phone' 
  | 'bank_account' 
  | 'safehouse'

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW'

export interface Entity {
  id: string
  name: string
  type: EntityType
  riskScore: number // 0-100
  riskLevel: RiskLevel
  status: 'Active Warrant' | 'Under Surveillance' | 'Detained' | 'Fugitive' | 'Flagged Entity' | 'Monitored'
  aliases: string[]
  primaryAffiliation: string
  role: string
  phoneMasked?: string
  vehicleNumber?: string
  city: string
  nationality?: string
  photo?: string
  lastKnownLocation: {
    name: string
    city: string
    lat: number
    lng: number
    timestamp: string
  }
  tags: string[]
  details: {
    dob?: string
    pob?: string
    wantedFor?: string[]
    knownAssociatesCount: number
    totalFinancialFlow: string // in ₹
    wiretapsCount: number
  }
}

export interface CrimePattern {
  id: string
  title: string
  category: 'Hawala Loop' | 'FASTag Transit' | 'SIM Call Burst'
  description: string
  confidence: number
  involvedEntities: string[]
  locations: string[]
  keyMetric: string
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED'
}

export type CaseStatus = 
  | 'Active Investigation' 
  | 'Chargesheet Filed' 
  | 'Surveillance Phase' 
  | 'Interdiction Imminent' 
  | 'Closed'

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM'

export interface Case {
  id: string
  caseNumber: string
  title: string
  description: string
  codeName: string
  status: CaseStatus
  priority: PriorityLevel
  leadInvestigator: string
  agency: string
  jurisdiction: string
  openedDate: string
  lastUpdated: string
  warrantsIssued: number
  assetsSeized: string
  entitiesCount: number
  evidenceCount: number
  riskIndex: number
}

export type EvidenceType = 
  | 'cdr' 
  | 'financial' 
  | 'wiretap' 
  | 'surveillance' 
  | 'forensics' 
  | 'document'

export type ClassificationLevel = 
  | 'CONFIDENTIAL' 
  | 'LAW ENFORCEMENT SENSITIVE' 
  | 'RESTRICTED POLICE RECORD'

export interface Evidence {
  id: string
  evidenceNumber: string
  caseId: string
  caseName: string
  title: string
  type: EvidenceType
  classification: ClassificationLevel
  dateCollected: string
  collectedBy: string
  badgeNumber: string
  location: string
  city: string
  hashSHA256: string
  aiSummary: string
  aiExtractionTags: string[]
  linkedEntityIds: string[]
  amountINR?: string
  phoneRef?: string
  vehicleRef?: string
  fileDetails: {
    filename: string
    size: string
    duration?: string
    format: string
  }
}

export interface GraphNode {
  id: string
  label: string
  type: EntityType
  riskScore: number
  degree: number
  cluster: string
  status: string
  isHVT?: boolean
  city?: string
  phoneMasked?: string
  vehicleNumber?: string
  x?: number
  y?: number
  isCore?: boolean
}

export type EdgeRelationship = 
  | 'hawala_transfer' 
  | 'known_associate' 
  | 'phone_call' 
  | 'director' 
  | 'courier' 
  | 'vehicle_registered'
  | 'safehouse_access'

export interface GraphEdge {
  id: string
  source: string
  target: string
  relationship: EdgeRelationship
  label: string
  amountINR?: string
  frequency?: number
  isSuspicious: boolean
  weight: number
}

export interface NetworkGraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'ROUTINE'

export interface ThreatAlert {
  id: string
  timestamp: string
  title: string
  description: string
  level: AlertSeverity
  source: 'CDR CLUSTER' | 'FASTag ANPR' | 'BANK / UPI FLAGGED' | 'AI PATTERN ENGINE'
  relatedEntityId?: string
  relatedEntityName?: string
  city?: string
  confidence: number
  isRead: boolean
}

export interface MetricData {
  id: string
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  threat: 'critical' | 'high' | 'neutral' | 'secure'
  subtext: string
  sparkline?: number[]
}

export type EventCategory = 'wiretap' | 'financial' | 'sighting' | 'warrant' | 'comm' | 'border'

export interface TimelineEvent {
  id: string
  timestamp: string
  title: string
  description: string
  category: EventCategory
  entityIds: string[]
  entityNames: string[]
  caseId: string
  severity: 'critical' | 'high' | 'info' | 'warning'
  location: string
  confidenceScore: number
  evidenceRef?: string
}
