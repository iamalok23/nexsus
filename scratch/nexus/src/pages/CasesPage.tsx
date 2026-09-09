import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Briefcase, 
  Plus, 
  ShieldCheck, 
  FileText, 
  Users, 
  FolderArchive, 
  TrendingUp, 
  Filter, 
  Search, 
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react'
import { mockCases, mockEntities, mockEvidence } from '../data/mockData'
import { Case, CaseStatus, PriorityLevel } from '../types'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { cn } from '../lib/utils'
import { api } from '../lib/api'
import { ApiStatusBanner } from '../components/common/ApiStatusBanner'

export const CasesPage: React.FC = () => {
  const navigate = useNavigate()
  const [cases, setCases] = useState<Case[]>(mockCases)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

  // New Case Form State
  const [newCaseTitle, setNewCaseTitle] = useState('')
  const [newCaseCodename, setNewCaseCodename] = useState('')
  const [newCaseLead, setNewCaseLead] = useState('ACP Vikramaditya Rathore')
  const [newCasePriority, setNewCasePriority] = useState<PriorityLevel>('HIGH')
  const [newCaseJurisdiction, setNewCaseJurisdiction] = useState('Delhi NCR / Uttar Pradesh Crime Corridor')
  const [newCaseDescription, setNewCaseDescription] = useState('')

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getCases()
      if (data && data.length > 0) {
        setCases(data)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Backend connection error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        c.caseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.codeName.toLowerCase().includes(q) ||
        c.leadInvestigator.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await api.createCase({
        title: newCaseTitle || 'Operation Chakravyuh - Node B',
        codeName: (newCaseCodename || 'CHAKRAVYUH-B').toUpperCase(),
        description: newCaseDescription || 'Investigating inter-city freight corridor anomalies.',
        priority: newCasePriority,
        leadInvestigator: newCaseLead,
        jurisdiction: newCaseJurisdiction,
      })
      setCases([created, ...cases])
    } catch (err: unknown) {
      console.warn('API create case error, using local fallback:', err)
      const fallbackCase: Case = {
        id: `case-${Date.now()}`,
        caseNumber: `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: newCaseTitle || 'Operation Chakravyuh - Local',
        codeName: (newCaseCodename || 'CHAKRAVYUH-LOCAL').toUpperCase(),
        description: newCaseDescription || 'Local synthetic investigation case.',
        status: 'Active Investigation',
        priority: newCasePriority,
        leadInvestigator: newCaseLead,
        agency: 'Special Cell (Synthetic Unit)',
        jurisdiction: newCaseJurisdiction,
        openedDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        warrantsIssued: 1,
        assetsSeized: '₹0',
        entitiesCount: 2,
        evidenceCount: 1,
        riskIndex: 65,
      }
      setCases([fallbackCase, ...cases])
    }

    setIsCreateModalOpen(false)
    setNewCaseTitle('')
    setNewCaseCodename('')
    setNewCaseDescription('')
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100">
              OPERATIONAL CASE DOSSIERS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active synthetic cases, corridor links, and multi-agency coordination
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="cyan"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ New Synthetic Case</span>
          </Button>
        </div>
      </div>

      {/* Backend API Connection Status Banner */}
      <ApiStatusBanner loading={loading} error={error} onRetry={fetchCases} label="CASES API" />

      {/* Case Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0c121e] border-slate-800">
          <CardContent className="p-3.5">
            <span className="text-[10px] text-slate-400 uppercase">Active Operations</span>
            <div className="text-xl font-bold text-slate-100 mt-1">{cases.length}</div>
            <span className="text-[10px] text-cyan-400">100% Inter-agency sync</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0c121e] border-slate-800">
          <CardContent className="p-3.5">
            <span className="text-[10px] text-slate-400 uppercase">Active Federal Warrants</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {cases.reduce((acc, c) => acc + c.warrantsIssued, 0)}
            </div>
            <span className="text-[10px] text-slate-400">Title III wiretaps active</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0c121e] border-slate-800">
          <CardContent className="p-3.5">
            <span className="text-[10px] text-slate-400 uppercase">Total Seized Assets</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">$123.5M</div>
            <span className="text-[10px] text-slate-400">Escrow & Forfeiture</span>
          </CardContent>
        </Card>
        <Card className="bg-[#0c121e] border-slate-800">
          <CardContent className="p-3.5">
            <span className="text-[10px] text-slate-400 uppercase">Tracked Targets</span>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              {cases.reduce((acc, c) => acc + c.entitiesCount, 0)}
            </div>
            <span className="text-[10px] text-slate-400">Suspects & Shell Orgs</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0c121e] p-3 rounded-sm border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case code, title, or lead agent..."
            className="pl-9 bg-slate-900 text-xs border-slate-700"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-sm border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active Investigation">Active Investigation</option>
            <option value="Interdiction Imminent">Interdiction Imminent</option>
            <option value="Surveillance Phase">Surveillance Phase</option>
            <option value="Grand Jury">Grand Jury</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-sm border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCases.map((c) => (
          <Card 
            key={c.id} 
            className="bg-[#0c121e] border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
            onClick={() => setSelectedCase(c)}
          >
            <CardHeader className="p-4 pb-2 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-cyan-400 font-bold">{c.caseNumber}</span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-amber-400 text-xs font-semibold">OP. {c.codeName}</span>
                </div>
                <Badge variant={c.priority === 'CRITICAL' ? 'critical' : c.priority === 'HIGH' ? 'high' : 'routine'}>
                  {c.priority}
                </Badge>
              </div>
              <CardTitle className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mt-1 font-sans">
                {c.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                {c.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] border-y border-slate-800/80 py-2">
                <div>
                  <span className="text-slate-400 block">Lead Investigator:</span>
                  <span className="text-slate-200 font-semibold">{c.leadInvestigator}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Jurisdiction:</span>
                  <span className="text-slate-200 truncate block">{c.jurisdiction}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex items-center space-x-3 text-slate-300">
                  <span>Warrants: <strong className="text-amber-400">{c.warrantsIssued}</strong></span>
                  <span>Assets: <strong className="text-emerald-400">{c.assetsSeized}</strong></span>
                  <span>Entities: <strong className="text-cyan-400">{c.entitiesCount}</strong></span>
                </div>

                <Button 
                  variant="tactical" 
                  size="sm" 
                  className="h-7 text-[10px]"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCase(c)
                  }}
                >
                  <span>Examine Dossier</span>
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Case Details Drawer / Modal */}
      {selectedCase && (
        <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
          <DialogContent onClose={() => setSelectedCase(null)}>
            <DialogHeader>
              <DialogTitle>CASE DOSSIER // {selectedCase.caseNumber}</DialogTitle>
              <div className="text-xs text-cyan-400 font-bold">OPERATION {selectedCase.codeName}</div>
            </DialogHeader>
            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Summary & Scope</div>
                <p className="mt-1 text-slate-200 leading-relaxed font-sans">{selectedCase.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded border border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Primary Agency:</span>
                  <span className="text-slate-200 font-semibold">{selectedCase.agency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Lead Agent:</span>
                  <span className="text-cyan-300 font-semibold">{selectedCase.leadInvestigator}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status:</span>
                  <span className="text-emerald-400 font-semibold">{selectedCase.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Opened Date:</span>
                  <span className="text-slate-200">{selectedCase.openedDate}</span>
                </div>
              </div>

              {/* Linked Targets */}
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold mb-2">
                  Key Linked Targets in Network
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {mockEntities.slice(0, 4).map(ent => (
                    <div 
                      key={ent.id} 
                      onClick={() => navigate(`/entity/${ent.id}`)}
                      className="p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 cursor-pointer flex items-center justify-between"
                    >
                      <span className="text-slate-200 truncate">{ent.name}</span>
                      <Badge variant={ent.riskScore > 85 ? 'critical' : 'high'} className="text-[8px]">
                        {ent.riskScore}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedCase(null)}>
                  Close
                </Button>
                <Button variant="cyan" size="sm" onClick={() => navigate('/network')}>
                  Plot Case on Graph
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Case Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent onClose={() => setIsCreateModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>INITIATE NEW INVESTIGATION DOSSIER</DialogTitle>
            <div className="text-xs text-slate-400">Enter federal task force charter specifications</div>
          </DialogHeader>
          <form onSubmit={handleCreateCase} className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                Operation Formal Title
              </label>
              <Input
                value={newCaseTitle}
                onChange={(e) => setNewCaseTitle(e.target.value)}
                placeholder="e.g. Operation Shadow Ledger"
                required
                className="bg-slate-900 border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                  Tactical Codename
                </label>
                <Input
                  value={newCaseCodename}
                  onChange={(e) => setNewCaseCodename(e.target.value)}
                  placeholder="SHADOW LEDGER"
                  required
                  className="bg-slate-900 border-slate-700 uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                  Threat Priority
                </label>
                <select
                  value={newCasePriority}
                  onChange={(e) => setNewCasePriority(e.target.value as PriorityLevel)}
                  className="w-full h-9 rounded-sm border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200"
                >
                  <option value="CRITICAL">CRITICAL (Tier-1)</option>
                  <option value="HIGH">HIGH (Tier-2)</option>
                  <option value="MEDIUM">MEDIUM (Tier-3)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                Operational Jurisdiction
              </label>
              <Input
                value={newCaseJurisdiction}
                onChange={(e) => setNewCaseJurisdiction(e.target.value)}
                placeholder="e.g. Eastern Europe / Black Sea Taskforce"
                className="bg-slate-900 border-slate-700"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                Investigation Charter & Synopsis
              </label>
              <textarea
                value={newCaseDescription}
                onChange={(e) => setNewCaseDescription(e.target.value)}
                rows={3}
                placeholder="Brief the suspected criminal enterprise, modus operandi, and interdiction objectives..."
                className="w-full rounded-sm border border-slate-700 bg-slate-900 p-2 text-xs text-slate-200 font-sans focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="pt-3 flex justify-end space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="cyan" size="sm">
                Issue Charter & Open Dossier
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
