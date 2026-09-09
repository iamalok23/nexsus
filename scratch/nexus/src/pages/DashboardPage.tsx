import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Share2, 
  ArrowRight, 
  ExternalLink, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Car, 
  Zap,
  Users,
  Repeat,
  Radio,
  FileText
} from 'lucide-react'
import { 
  mockMetrics, 
  mockAlerts, 
  mockEntities, 
  mockNetworkGraph, 
  mockCrimePatterns, 
  mockEvidence 
} from '../data/mockData'
import { MetricCard } from '../components/common/MetricCard'
import { AlertCard } from '../components/common/AlertCard'
import { NetworkGraphContainer } from '../components/network/NetworkGraphContainer'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { api, CaseInsightsResponse } from '../lib/api'
import { ApiStatusBanner } from '../components/common/ApiStatusBanner'
import { MetricData, CrimePattern, ThreatAlert, NetworkGraphData, Entity } from '../types'

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

  return (
    <div className="space-y-6 font-mono">
      {/* Top Welcome & Mission Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100">
              OPERATION CHAKRAVYUH // COMMAND DASHBOARD
            </h1>
            <Badge variant="critical">ACTIVE</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Special Cell Delhi Police & UP STF • Inter-State Crime Network Analysis Grid (SIH 2026)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/network">
            <Button variant="tactical" size="sm" className="flex items-center space-x-1.5 h-8">
              <Share2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Open Network Graph</span>
            </Button>
          </Link>
          <Link to="/upload">
            <Button variant="cyan" size="sm" className="h-8">
              <span>+ Ingest Evidence</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Backend API Status Banner */}
      <ApiStatusBanner loading={loading} error={error} onRetry={fetchDashboardData} label="DASHBOARD & INSIGHTS API" />

      {/* 4 Core Required Hackathon Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCard
            key={m.id}
            title={m.title}
            value={m.value}
            change={m.change}
            trend={m.trend}
            threat={m.threat}
            subtext={m.subtext}
            sparkline={m.sparkline}
          />
        ))}
      </div>

      {/* 3 Detected Crime Patterns Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              AI Detected Modus Operandi // Potential Crime Patterns
            </h2>
          </div>
          <Badge variant="amber">PATTERN ENGINE ACTIVE</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {patterns.map((pattern) => (
            <Card key={pattern.id} className="bg-[#0c121e] border-slate-800 hover:border-amber-500/50 transition-all p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <Badge variant={pattern.severity === 'CRITICAL' ? 'critical' : 'high'}>
                  {pattern.category}
                </Badge>
                <span className="text-cyan-400 text-[10px] font-bold">
                  {pattern.confidence}% CONFIDENCE
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-100 font-sans">{pattern.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans line-clamp-3">
                  {pattern.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Key Evidence Metric:</span>
                  <span className="text-emerald-400 font-bold">{pattern.keyMetric}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Corridor:</span>
                  <span className="text-slate-300 truncate max-w-[150px]">{pattern.locations[0]}</span>
                </div>
              </div>

              <div className="pt-1">
                <Link to="/network">
                  <Button variant="outline" size="sm" className="w-full h-7 text-[10px] flex items-center justify-center space-x-1">
                    <span>Inspect In Graph</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Network Topology Radar & Recent Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simplified Network Topology Radar (2 cols) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-cyan-300">
                Core Syndicate Topology // 7-8 Connected Entities
              </h2>
            </div>
            <Link to="/network" className="text-[11px] text-cyan-400 hover:underline flex items-center">
              <span>Full Screen Workspace</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </div>

          <NetworkGraphContainer
            initialData={networkData}
            height="h-[420px]"
          />
        </div>

        {/* Priority Intercept Stream (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-red-400" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-200">
                Real-Time Intercept Alerts ({alerts.length})
              </h2>
            </div>
            <Badge variant="critical">LIVE STREAM</Badge>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
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

      {/* Tracked Syndicate Roster Table */}
      <Card className="bg-[#0c121e] border-slate-800">
        <CardHeader className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tracked Subjects of Interest ({entities.length} Profiles)</CardTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Profiles requiring review, masked mobile contacts, registered vehicles, and operating cities
              </p>
            </div>
            <Link to="/person/ent-1">
              <Button variant="outline" size="sm" className="h-7 text-[10px]">
                Open Full Dossiers
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="p-2.5 font-semibold">Name & Role</th>
                  <th className="p-2.5 font-semibold">Operating City</th>
                  <th className="p-2.5 font-semibold">Masked Phone</th>
                  <th className="p-2.5 font-semibold">Vehicle</th>
                  <th className="p-2.5 font-semibold">Risk Score</th>
                  <th className="p-2.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {entities.slice(0, 7).map((person) => (
                  <tr key={person.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-2.5">
                      <div className="font-bold text-slate-100">{person.name}</div>
                      <div className="text-[10px] text-cyan-400">{person.role}</div>
                    </td>
                    <td className="p-2.5 text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                        {person.city}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-300">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-cyan-400 shrink-0" />
                        {person.phoneMasked || 'N/A'}
                      </span>
                    </td>
                    <td className="p-2.5 text-amber-300 font-semibold">
                      {person.vehicleNumber ? (
                        <span className="flex items-center gap-1">
                          <Car className="h-3 w-3 text-amber-400 shrink-0" />
                          {person.vehicleNumber}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <Badge variant={person.riskScore >= 90 ? 'critical' : person.riskScore >= 75 ? 'high' : 'cyan'}>
                        {person.riskScore}/100
                      </Badge>
                    </td>
                    <td className="p-2.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-cyan-400 hover:text-cyan-300"
                        onClick={() => navigate(`/person/${person.id}`)}
                      >
                        <span>Dossier</span>
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
