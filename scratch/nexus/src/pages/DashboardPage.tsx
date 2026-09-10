import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Share2, 
  ArrowRight, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Car, 
  Zap, 
  Users, 
  Crosshair, 
  Maximize2, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react'
import { 
  mockMetrics, 
  mockAlerts, 
  mockEntities, 
  mockNetworkGraph, 
  mockCrimePatterns 
} from '../data/mockData'
import { MetricCard } from '../components/common/MetricCard'
import { AlertCard } from '../components/common/AlertCard'
import { NetworkGraphContainer } from '../components/network/NetworkGraphContainer'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { api } from '../lib/api'
import { ApiStatusBanner } from '../components/common/ApiStatusBanner'
import { MetricData, CrimePattern, ThreatAlert, NetworkGraphData, Entity } from '../types'
import { 
  FinancialLoopThumbnail, 
  HighwayTransitThumbnail, 
  TelecomBurstThumbnail 
} from '../components/common/PatternVisualizations'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics)
  const [patterns, setPatterns] = useState<CrimePattern[]>(mockCrimePatterns)
  const [alerts, setAlerts] = useState<ThreatAlert[]>(mockAlerts)
  const [networkData, setNetworkData] = useState<NetworkGraphData>(mockNetworkGraph)
  const [entities, setEntities] = useState<Entity[]>(mockEntities)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [insightsRes, networkRes, entitiesRes] = await Promise.allSettled([
        api.getInsights('case-sih-01'),
        api.getNetwork('case-sih-01'),
        api.getEntities(),
      ])

      let hasSuccess = false

      if (insightsRes.status === 'fulfilled' && insightsRes.value) {
        hasSuccess = true
        if (insightsRes.value.metrics && insightsRes.value.metrics.length > 0) {
          setMetrics(insightsRes.value.metrics)
        }
        if (insightsRes.value.patterns && insightsRes.value.patterns.length > 0) {
          setPatterns(insightsRes.value.patterns)
        }
        if (insightsRes.value.alerts && insightsRes.value.alerts.length > 0) {
          setAlerts(insightsRes.value.alerts)
        }
      }

      if (networkRes.status === 'fulfilled' && networkRes.value) {
        hasSuccess = true
        setNetworkData(networkRes.value)
      }

      if (entitiesRes.status === 'fulfilled' && entitiesRes.value && entitiesRes.value.length > 0) {
        hasSuccess = true
        setEntities(entitiesRes.value)
      }

      if (!hasSuccess) {
        const err = insightsRes.status === 'rejected' ? insightsRes.reason : 'Failed to connect to backend'
        const message = err instanceof Error ? err.message : 'Backend unreachable'
        setError(message)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Backend connection error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Helper to render appropriate mini thumbnail for pattern
  const renderPatternThumbnail = (pattern: CrimePattern) => {
    const cat = (pattern.category || '').toLowerCase()
    const id = pattern.id
    if (cat.includes('hawala') || cat.includes('fund') || id === 'pat-1') {
      return <FinancialLoopThumbnail className="my-2.5" />
    }
    if (cat.includes('fastag') || cat.includes('transit') || cat.includes('highway') || id === 'pat-2') {
      return <HighwayTransitThumbnail className="my-2.5" />
    }
    return <TelecomBurstThumbnail className="my-2.5" />
  }

  return (
    <div className="space-y-6 font-mono text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Command Center Ops Deck Status Header */}
      <div className="relative overflow-hidden tactical-panel tactical-corner p-4 border border-slate-300 dark:border-cyan-500/25">
        <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-xs bg-red-100 border border-red-300 text-red-900 dark:bg-red-950/80 dark:border-red-500/60 dark:text-red-300 text-[10px] font-bold tracking-wider animate-pulse shadow-xs dark:shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                <span>DEFCON 2 // ACTIVE INTERCEPT</span>
              </span>

              <Badge variant="cyan" className="text-[10px] tracking-wider">
                GRID: NCR-DELHI-UP
              </Badge>

              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                LAT: 28.6139° N, LONG: 77.2090° E
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>OPERATION CHAKRAVYUH</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-normal">//</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium text-lg md:text-xl">TACTICAL COMMAND DECK</span>
            </h1>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans max-w-3xl">
              Special Cell Delhi Police & UP Special Task Force Joint Command. Ingesting live CDR, FASTag ANPR feeds, Hawala banking loops, and multi-agency intelligence graph.
            </p>
          </div>

          {/* Quick Tactical Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/network">
              <Button 
                variant="tactical" 
                size="sm" 
                className="h-8.5 px-3.5 flex items-center space-x-2 border-cyan-600/40 dark:border-cyan-400/60 bg-cyan-50 dark:bg-cyan-950/70 text-cyan-900 dark:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-cyan-900/80 shadow-xs dark:shadow-tactical transition-all"
              >
                <Share2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300 animate-pulse" />
                <span className="font-bold">Network Topology</span>
              </Button>
            </Link>

            <Link to="/upload">
              <Button 
                variant="cyan" 
                size="sm" 
                className="h-8.5 px-3.5 flex items-center space-x-1.5 bg-cyan-600 dark:bg-cyan-400 text-white dark:text-slate-950 font-bold hover:bg-cyan-500 dark:hover:bg-cyan-300 shadow-xs dark:shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                <span>+ Ingest Evidence</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Backend API Status Banner */}
      <ApiStatusBanner loading={loading} error={error} onRetry={fetchDashboardData} label="DASHBOARD & INSIGHTS API" />

      {/* 2. 4 Core Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <MetricCard
            key={m.id}
            title={m.title}
            value={m.value}
            change={m.change}
            trend={m.trend}
            threat={m.threat}
            subtext={m.subtext}
            sparkline={m.sparkline}
            channelId={`TEL-0${idx + 1} // NCR-GRID`}
          />
        ))}
      </div>

      {/* 3. AI Modus Operandi & Incident Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-1 rounded-xs bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400 shadow-xs dark:shadow-amber-glow">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>AI Detected Modus Operandi</span>
                <span className="text-cyan-600 dark:text-cyan-400">//</span>
                <span className="text-amber-700 dark:text-amber-400 text-xs font-semibold">Active Pattern Analysis</span>
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                Algorithmic synthesis across CDR call bursts, FASTag telemetry, and Hawala mule transactions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            <Badge variant="amber" className="text-[9px] tracking-wider font-bold">
              3 ACTIVE PATTERNS
            </Badge>
          </div>
        </div>

        {/* 3 Modular Tactical Dossier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {patterns.map((pattern, idx) => (
            <Card 
              key={pattern.id} 
              className="tactical-panel tactical-corner relative overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] flex flex-col justify-between p-4 space-y-3 group"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-amber-500 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Dossier Code & Severity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 tracking-wider">
                      DOSSIER-PAT-00{idx + 1}
                    </span>
                    <span className="text-slate-400 text-[9px]">•</span>
                    <Badge variant={pattern.severity === 'CRITICAL' ? 'critical' : 'high'} className="text-[9px] px-1.5 py-0">
                      {pattern.category}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-1 text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-300 tabular-nums">
                    <Sparkles className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                    <span>{pattern.confidence}% CONF</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mt-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                    {pattern.title}
                  </h3>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed font-sans line-clamp-3">
                    {pattern.description}
                  </p>
                </div>

                {/* Embedded Mini Visualization Preview */}
                {renderPatternThumbnail(pattern)}

                {/* Key Evidence & Corridor Metadata */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Key Evidence:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold tabular-nums truncate max-w-[160px]">
                      {pattern.keyMetric}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Primary Corridor:</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-[160px] flex items-center gap-1 font-semibold">
                      <MapPin className="h-2.5 w-2.5 text-red-500 dark:text-red-400 shrink-0" />
                      {pattern.locations[0]}
                    </span>
                  </div>

                  {pattern.involvedEntities && pattern.involvedEntities.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Involved Targets:</span>
                      <span className="text-cyan-800 dark:text-cyan-300 font-semibold truncate max-w-[160px]">
                        {pattern.involvedEntities.slice(0, 2).join(', ')}
                        {pattern.involvedEntities.length > 2 ? ` +${pattern.involvedEntities.length - 2}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: INSPECT IN GRAPH */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60">
                <Link to="/network" className="block w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-7.5 text-[10px] font-mono font-bold tracking-wider flex items-center justify-center space-x-1.5 border-cyan-600/40 dark:border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-black hover:shadow-sm dark:hover:shadow-tactical transition-all group/btn"
                  >
                    <span>INSPECT IN GRAPH</span>
                    <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Network Topology Radar & Real-Time Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simplified Network Topology Radar (2 cols) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-xs bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-400">
                <Crosshair className="h-4 w-4 animate-spin [animation-duration:12s]" />
              </div>
              <div>
                <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Core Syndicate Topology</span>
                  <span className="text-cyan-600 dark:text-cyan-400">//</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">7-8 Linked Nodes</span>
                </h2>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                  NetworkX Centrality Analysis • Direct Financial & Communication Hops
                </span>
              </div>
            </div>

            <Link 
              to="/network" 
              className="text-[11px] font-mono font-semibold text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-200 hover:underline flex items-center gap-1 px-2.5 py-1 rounded-xs bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 transition-colors"
            >
              <span>Full Screen Workspace</span>
              <Maximize2 className="h-3 w-3" />
            </Link>
          </div>

          <div className="tactical-panel tactical-corner relative rounded-xs border border-slate-300 dark:border-cyan-500/20 overflow-hidden">
            <NetworkGraphContainer
              initialData={networkData}
              height="h-[430px]"
            />
          </div>
        </div>

        {/* Real-Time Priority Intercept Stream (1 col) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-xs bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 shadow-xs dark:shadow-threat">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Priority Intercepts</span>
                  <span className="text-red-600 dark:text-red-400 tabular-nums font-bold">({alerts.length})</span>
                </h2>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                  Automated ANPR & Telecom Triggers
                </span>
              </div>
            </div>

            <Badge variant="critical" className="text-[9px]">
              LIVE STREAM
            </Badge>
          </div>

          <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 5. Tracked Syndicate Roster Table */}
      <Card className="tactical-panel tactical-corner relative overflow-hidden border border-slate-300 dark:border-slate-800">
        <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#040812]/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <CardTitle className="text-sm">Tracked Subjects of Interest ({entities.length} Dossiers)</CardTitle>
                <Badge variant="cyan" className="text-[9px]">ACTIVE SURVEILLANCE</Badge>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-sans">
                Verified Indian investigation subjects, masked mobile contacts, registered vehicle plates, and operating cities
              </p>
            </div>
            
            <Link to="/person/ent-1">
              <Button variant="outline" size="sm" className="h-7.5 text-[10px] border-slate-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 flex items-center space-x-1">
                <span>View Full Dossiers</span>
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-[#03060c]/60 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Subject & Primary Role</th>
                  <th className="py-3 px-4 font-semibold">Operating City</th>
                  <th className="py-3 px-4 font-semibold">Masked Contact</th>
                  <th className="py-3 px-4 font-semibold">Registered Vehicle</th>
                  <th className="py-3 px-4 font-semibold">Threat Score</th>
                  <th className="py-3 px-4 font-semibold text-right">Dossier Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-transparent">
                {entities.slice(0, 7).map((person) => (
                  <tr key={person.id} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                        <span>{person.name}</span>
                        {person.aliases && person.aliases[0] && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">("{person.aliases[0]}")</span>
                        )}
                      </div>
                      <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono tracking-wide">{person.role}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-red-500 dark:text-red-400 shrink-0" />
                        <span>{person.city}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 tabular-nums">
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <span>{person.phoneMasked || 'N/A'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {person.vehicleNumber ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 font-semibold text-[10px] tracking-wider">
                          <Car className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          {person.vehicleNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={person.riskScore >= 90 ? 'critical' : person.riskScore >= 75 ? 'high' : 'cyan'}
                          className="tabular-nums"
                        >
                          {person.riskScore}/100
                        </Badge>
                        {/* Mini progress bar */}
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full ${
                              person.riskScore >= 90 ? 'bg-red-500 shadow-xs dark:shadow-[0_0_8px_#ef4444]' :
                              person.riskScore >= 75 ? 'bg-amber-500 dark:bg-amber-400' : 'bg-cyan-600 dark:bg-cyan-400'
                            }`} 
                            style={{ width: `${person.riskScore}%` }} 
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6.5 px-2.5 text-[10px] text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 border border-transparent hover:border-cyan-300 dark:hover:border-cyan-500/30"
                        onClick={() => navigate(`/person/${person.id}`)}
                      >
                        <span>DOSSIER</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
