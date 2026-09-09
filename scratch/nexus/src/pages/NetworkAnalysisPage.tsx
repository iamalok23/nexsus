import React, { useState, useEffect, useCallback } from 'react'
import { 
  Share2, 
  Download, 
  Route, 
  Zap, 
  Info,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { mockNetworkGraph, mockEntities } from '../data/mockData'
import { NetworkGraphContainer } from '../components/network/NetworkGraphContainer'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'
import { api } from '../lib/api'
import { ApiStatusBanner } from '../components/common/ApiStatusBanner'
import { NetworkGraphData } from '../types'

export const NetworkAnalysisPage: React.FC = () => {
  const [networkData, setNetworkData] = useState<NetworkGraphData>(mockNetworkGraph)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pathfinderOpen, setPathfinderOpen] = useState(false)
  const [sourceNode, setSourceNode] = useState('ent-1')
  const [targetNode, setTargetNode] = useState('ent-2')
  const [pathResult, setPathResult] = useState<string[] | null>(null)

  const fetchNetwork = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getNetwork('case-sih-01')
      if (data && data.nodes && data.nodes.length > 0) {
        setNetworkData(data)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Backend connection error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNetwork()
  }, [fetchNetwork])

  const handleRunPathfinder = () => {
    // Demonstration of shortest link between Rahul Verma and target
    if (targetNode === 'ent-b1' || targetNode === 'ent-2') {
      setPathResult([
        'Rahul Verma (Primary Coordinator - Delhi)',
        'Amit Yadav (Financial Link - Ghaziabad)',
        'Canara Bank Commercial Acct #0492 (₹12.5L Transfer)'
      ])
    } else {
      setPathResult([
        'Rahul Verma (Delhi)',
        'Suresh Sharma (Logistics)',
        'Mahindra Scorpio (UP14 AB 1234)'
      ])
    }
  }

  const handleExport = () => {
    alert('Exporting Graph Analysis Summary (NetworkX Topological Report)')
  }

  return (
    <div className="space-y-4 font-mono">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Share2 className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100">
              CRIMINAL NETWORK TOPOLOGY ANALYSIS
            </h1>
            <Badge variant="cyan">CORE GRAPH VIEW</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive link analysis connecting suspects, shell companies, vehicles (FASTag) & hawala bank accounts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pathfinder Tool */}
          <Button
            variant={pathfinderOpen ? 'cyan' : 'tactical'}
            size="sm"
            onClick={() => setPathfinderOpen(!pathfinderOpen)}
            className="flex items-center space-x-1.5 h-8 text-xs"
          >
            <Route className="h-3.5 w-3.5" />
            <span>Trace Shortest Link</span>
          </Button>

          {/* Export Report */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center space-x-1.5 h-8 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Case Graph</span>
          </Button>
        </div>
      </div>

      {/* Backend API Connection Status Banner */}
      <ApiStatusBanner loading={loading} error={error} onRetry={fetchNetwork} label="NETWORK GRAPH API (NETWORKX)" />

      {/* Pathfinder Subpanel */}
      {pathfinderOpen && (
        <Card className="bg-[#0c121e] border-cyan-500/50 p-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                TRACE CRIME ATTRIBUTION PATH:
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 text-[10px]">Source:</span>
                <select
                  value={sourceNode}
                  onChange={(e) => setSourceNode(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200 text-xs"
                >
                  <option value="ent-1">Rahul Verma (Delhi)</option>
                  <option value="ent-2">Amit Yadav (Ghaziabad)</option>
                </select>
              </div>
              <span className="text-slate-400">➔</span>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 text-[10px]">Target:</span>
                <select
                  value={targetNode}
                  onChange={(e) => setTargetNode(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200 text-xs"
                >
                  <option value="ent-b1">Canara Bank Hawala Acct</option>
                  <option value="ent-v1">Scorpio (UP14 AB 1234)</option>
                  <option value="ent-3">Priya Singh (Noida)</option>
                  <option value="ent-4">Suresh Sharma (Lucknow)</option>
                </select>
              </div>
              <Button variant="cyan" size="sm" onClick={handleRunPathfinder} className="h-7 text-[10px]">
                Calculate Link
              </Button>
            </div>

            {pathResult && (
              <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                <span>Direct Vector:</span>
                <span className="text-slate-200">{pathResult.join(' ➔ ')}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Presentation Graph Powered by NetworkX */}
      <NetworkGraphContainer
        initialData={networkData}
        height="h-[calc(100vh-210px)] min-h-[560px]"
      />
    </div>
  )
}
