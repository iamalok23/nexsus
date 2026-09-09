import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  UserCheck, 
  MapPin, 
  ShieldAlert, 
  Share2, 
  Phone, 
  CreditCard, 
  FileText, 
  Building2, 
  ExternalLink,
  Flame,
  Car,
  Tag
} from 'lucide-react'
import { mockEntities, mockEvidence, mockNetworkGraph } from '../data/mockData'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { EvidenceCard } from '../components/common/EvidenceCard'
import { cn } from '../lib/utils'
import { api } from '../lib/api'
import { ApiStatusBanner } from '../components/common/ApiStatusBanner'
import { Entity } from '../types'

export const EntityProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const initialPerson = mockEntities.find(e => e.id === id) || mockEntities[0]
  const [person, setPerson] = useState<Entity>(initialPerson)
  const [entityList, setEntityList] = useState<Entity[]>(mockEntities)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntityData = useCallback(async () => {
    const targetId = id || 'ent-1'
    try {
      setLoading(true)
      setError(null)
      const [entityRes, allEntitiesRes] = await Promise.allSettled([
        api.getEntity(targetId),
        api.getEntities(),
      ])

      if (entityRes.status === 'fulfilled' && entityRes.value) {
        setPerson(entityRes.value)
      } else {
        const fallback = mockEntities.find(e => e.id === targetId) || mockEntities[0]
        setPerson(fallback)
        if (entityRes.status === 'rejected') {
          const reason = entityRes.reason
          const message = reason instanceof Error ? reason.message : 'Failed to fetch entity from backend'
          setError(message)
        }
      }

      if (allEntitiesRes.status === 'fulfilled' && allEntitiesRes.value && allEntitiesRes.value.length > 0) {
        setEntityList(allEntitiesRes.value)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Backend connection error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEntityData()
  }, [fetchEntityData])

  // Direct associates from graph edges
  const associateEdges = mockNetworkGraph.edges.filter(
    e => e.source === person.id || e.target === person.id
  )

  const associates = associateEdges.map(edge => {
    const peerId = edge.source === person.id ? edge.target : edge.source
    const peer = entityList.find(e => e.id === peerId) || mockEntities.find(e => e.id === peerId)
    return {
      edge,
      peer: peer || {
        id: peerId,
        name: edge.label,
        type: 'suspect' as const,
        riskScore: 75,
        riskLevel: 'HIGH' as const,
        role: 'Affiliated Contact',
        city: person.city,
        status: 'Monitored' as const,
        aliases: [],
        primaryAffiliation: 'Syndicate Contact',
        lastKnownLocation: person.lastKnownLocation,
        tags: ['Associate'],
        details: {
          knownAssociatesCount: 1,
          totalFinancialFlow: '₹0',
          wiretapsCount: 0,
        },
      }
    }
  })

  // Linked evidence items
  const linkedEvidence = mockEvidence.filter(ev => ev.linkedEntityIds.includes(person.id))

  return (
    <div className="space-y-6 font-mono">
      {/* Target Quick Switcher Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-800">
        <span className="text-[10px] uppercase text-slate-400 font-semibold shrink-0">Switch Subject:</span>
        {entityList.slice(0, 8).map(e => (
          <button
            key={e.id}
            onClick={() => navigate(`/person/${e.id}`)}
            className={cn(
              'px-2.5 py-1 rounded-xs text-[10px] whitespace-nowrap transition-colors border',
              e.id === person.id
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            )}
          >
            {e.name} ({e.city})
          </button>
        ))}
      </div>

      {/* Backend API Connection Status Banner */}
      <ApiStatusBanner loading={loading} error={error} onRetry={fetchEntityData} label={`ENTITY DOSSIER API (${person.name})`} />

      {/* Target Dossier Header Card */}
      <Card className="bg-[#0c121e] border-slate-800 p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-red-950/80 border-b border-l border-red-800/80 px-4 py-1 font-mono text-[9px] font-bold text-red-300 tracking-widest uppercase">
          POLICE RECORD: {person.riskScore >= 85 ? 'HIGH VALUE TARGET (HVT)' : 'PERSON OF INTEREST'}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pt-2">
          {/* Target Mugshot / Identity */}
          <div className="flex items-start space-x-4">
            <div className="relative shrink-0">
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.name}
                  className="h-24 w-24 rounded-xs object-cover border-2 border-slate-700 shadow-md grayscale contrast-125"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xs bg-slate-900 border-2 border-slate-700 text-cyan-400">
                  <Building2 className="h-10 w-10" />
                </div>
              )}
              <div className="absolute -bottom-2 -left-1 px-1.5 py-0.5 rounded bg-black/90 border border-slate-700 text-[8px] text-cyan-300 font-bold">
                ID: {person.id.toUpperCase()}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-100">{person.name}</h1>
              </div>
              <p className="text-xs font-bold text-cyan-400">{person.role}</p>
              <p className="text-xs text-slate-400">{person.primaryAffiliation}</p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Badge variant={person.status.includes('Warrant') ? 'critical' : 'amber'}>
                  {person.status}
                </Badge>
                <span className="text-[10px] text-slate-300 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {person.city}
                </span>
                {person.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Threat Radar & Action Buttons */}
          <div className="flex flex-col items-end space-y-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">Threat Score Index</div>
                <div className="text-3xl font-black text-red-500 font-mono">
                  {person.riskScore}<span className="text-sm text-slate-400 font-normal">/100</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-red-500/80 flex items-center justify-center bg-red-950/40 animate-pulse">
                <Flame className="h-6 w-6 text-red-400" />
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Link to="/network" className="w-full md:w-auto">
                <Button variant="tactical" size="sm" className="w-full flex items-center justify-center space-x-1 h-8">
                  <Share2 className="h-3.5 w-3.5" />
                  <span>View in Graph</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* GPS Last Location Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-red-400" />
            <span>LAST KNOWN GPS:</span>
            <span className="text-slate-200 font-semibold">{person.lastKnownLocation.name}, {person.city}</span>
          </div>
          <div className="flex items-center space-x-4">
            {person.phoneMasked && (
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <Phone className="h-3.5 w-3.5" />
                {person.phoneMasked}
              </span>
            )}
            {person.vehicleNumber && (
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Car className="h-3.5 w-3.5 text-amber-400" />
                {person.vehicleNumber}
              </span>
            )}
          </div>
        </div>
      </Card>
      
      {/* Tabbed Intelligence Dossier */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto border-b border-slate-800 bg-[#0c121e]">
          <TabsTrigger value="overview">Dossier Overview</TabsTrigger>
          <TabsTrigger value="associates">Network Associates ({associates.length})</TabsTrigger>
          <TabsTrigger value="financial">Financial Transactions (₹)</TabsTrigger>
          <TabsTrigger value="evidence">Linked Evidence ({linkedEvidence.length})</TabsTrigger>
        </TabsList>

        {/* 1. Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#0c121e] border-slate-800">
              <CardHeader className="p-4 border-b border-slate-800">
                <CardTitle>Suspect Record & Legal Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Date of Birth:</span>
                    <span className="text-slate-200 font-semibold">{person.details.dob || '1985-04-12'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Native Location:</span>
                    <span className="text-slate-200 font-semibold">{person.details.pob || person.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Known Aliases:</span>
                    <span className="text-cyan-300 font-semibold">{person.aliases.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tracked Vehicle:</span>
                    <span className="text-amber-300 font-bold">{person.vehicleNumber || 'No registered vehicle'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Registered Charges & IPC / PMLA Sections
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {(person.details.wantedFor || ['Organized Crime Conspiracy (IPC 120B)']).map((charge, i) => (
                      <li key={i} className="flex items-start space-x-1.5 text-[11px]">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{charge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0c121e] border-slate-800">
              <CardHeader className="p-4 border-b border-slate-800">
                <CardTitle>Operational Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Total Tracked Illicit Flow:</span>
                    <span className="text-emerald-400 font-bold">{person.details.totalFinancialFlow}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Network Connections:</span>
                    <span className="text-cyan-400 font-bold">{associates.length} Direct Links</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Intercepted Call Logs:</span>
                    <span className="text-amber-400 font-bold">{person.details.wiretapsCount} Recorded Sessions</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Primary Movement Corridors
                  </span>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span>Delhi ➔ Ghaziabad (NH-24 / Expressway)</span>
                      <Badge variant="critical">Daily Commute</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span>Yamuna Expressway (Jewar Toll Plaza)</span>
                      <Badge variant="amber">FASTag Hit</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span>Noida Sector 62 ➔ Lucknow Hazratganj</span>
                      <Badge variant="cyan">Transit Route</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. Associates Tab */}
        <TabsContent value="associates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {associates.map((item, idx) => (
              <Card key={idx} className="bg-[#0c121e] border-slate-800 p-3 hover:border-cyan-500/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={item.peer.riskScore >= 85 ? 'critical' : 'high'}>
                    THREAT {item.peer.riskScore}
                  </Badge>
                  <span className="text-[9px] text-slate-400 uppercase">{item.edge.relationship}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-100">{item.peer.name}</h4>
                <p className="text-[10px] text-cyan-400 font-semibold">{item.edge.label}</p>
                {item.edge.amountINR && (
                  <p className="text-[11px] text-emerald-400 font-bold mt-1">{item.edge.amountINR}</p>
                )}
                <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[10px] text-cyan-400"
                    onClick={() => navigate(`/person/${item.peer.id}`)}
                  >
                    Examine Target
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 3. Financial Tab */}
        <TabsContent value="financial">
          <Card className="bg-[#0c121e] border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Hawala & Bank Transaction Ledger (₹)</CardTitle>
              <span className="text-emerald-400 font-bold text-sm">Aggregated: {person.details.totalFinancialFlow}</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <div className="font-bold text-slate-100">Chandni Chowk Bullion ➔ Amit Yadav (Ghaziabad)</div>
                  <div className="text-[10px] text-slate-400">Cash Hawala Handover coordinated via call on +91 98XXXXXX21</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">₹12,50,000</div>
                  <Badge variant="critical">HAWALA LOOP</Badge>
                </div>
              </div>

              <div className="p-3 rounded bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <div className="font-bold text-slate-100">Canara Bank Hazraganj ➔ Priya Singh (Apex Trans Logistics)</div>
                  <div className="text-[10px] text-slate-400">Structured RTGS Transfer for fake transport invoices</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">₹7,30,000</div>
                  <Badge variant="high">SHELL ENTITY</Badge>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* 4. Evidence Tab */}
        <TabsContent value="evidence">
          {linkedEvidence.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-[#0c121e] border border-slate-800 rounded">
              No directly linked evidence records for this person.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedEvidence.map(ev => (
                <EvidenceCard key={ev.id} evidence={ev} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
