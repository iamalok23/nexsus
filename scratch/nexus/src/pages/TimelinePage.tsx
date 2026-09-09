import React, { useState } from 'react'
import { 
  Clock, 
  Filter, 
  MapPin, 
  Search, 
  ShieldAlert, 
  FileText, 
  Radio, 
  DollarSign, 
  Eye, 
  Lock, 
  ChevronRight,
  Calendar
} from 'lucide-react'
import { mockTimelineEvents, mockEntities, mockCases } from '../data/mockData'
import { TimelineEvent, EventCategory } from '../types'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { cn } from '../lib/utils'

export const TimelinePage: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>(mockTimelineEvents)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [inspectEvent, setInspectEvent] = useState<TimelineEvent | null>(null)

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== 'ALL' && ev.category !== selectedCategory) return false
    if (selectedEntity !== 'ALL' && !ev.entityIds.includes(selectedEntity)) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        ev.entityNames.some(n => n.toLowerCase().includes(q))
      )
    }
    return true
  })

  const getCategoryIcon = (category: EventCategory) => {
    switch (category) {
      case 'wiretap':
        return <Radio className="h-4 w-4 text-cyan-400" />
      case 'financial':
        return <DollarSign className="h-4 w-4 text-emerald-400" />
      case 'sighting':
        return <Eye className="h-4 w-4 text-amber-400" />
      case 'warrant':
        return <Lock className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-purple-400" />
    }
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100">
              OPERATIONAL INVESTIGATION TIMELINE
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chronological multi-vector event correlation across wiretaps, financial flows, ANPR sightings & warrants
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="cyan">CHRONO-SYNC ACTIVE</Badge>
          <Badge variant="critical">CRITICAL SURVEILLANCE</Badge>
        </div>
      </div>

      {/* Filter and Correlation Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#0c121e] p-3 rounded-sm border border-slate-800 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timeline events, locations, entities..."
            className="pl-9 bg-slate-900 border-slate-700 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-sm border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">All Event Types</option>
            <option value="wiretap">Audio & Wiretaps</option>
            <option value="financial">Financial Transfers</option>
            <option value="sighting">ANPR & Physical Sightings</option>
            <option value="warrant">Raids & Warrants</option>
            <option value="comm">Encrypted Comms</option>
          </select>

          {/* Target Correlator */}
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="rounded-sm border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">Correlate All Targets</option>
            {mockEntities.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chronological Stream */}
      <div className="relative border-l-2 border-slate-800 ml-4 md:ml-6 pl-6 space-y-6">
        {filteredEvents.map((ev, index) => (
          <div key={ev.id} className="relative group">
            {/* Timeline Node Bullet */}
            <div className={cn(
              'absolute -left-[31px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-[#0c121e] transition-transform group-hover:scale-110',
              ev.severity === 'critical' ? 'border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]' :
              ev.severity === 'high' ? 'border-amber-500 text-amber-400' :
              'border-cyan-500 text-cyan-400'
            )}>
              {getCategoryIcon(ev.category)}
            </div>

            {/* Event Card */}
            <Card 
              className={cn(
                'bg-[#0c121e] border-slate-800 hover:border-cyan-500/50 transition-all p-4 cursor-pointer',
                ev.severity === 'critical' && 'border-l-4 border-l-red-500'
              )}
              onClick={() => setInspectEvent(ev)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-cyan-400">{ev.timestamp}</span>
                  <span className="text-slate-400 text-[10px]">•</span>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">{ev.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={ev.severity === 'critical' ? 'critical' : ev.severity === 'high' ? 'high' : 'cyan'}>
                    {ev.severity.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-cyan-300 font-bold">
                    {ev.confidenceScore}% CONF
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors font-sans">
                {ev.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                {ev.description}
              </p>

              {/* Correlated Entities & Location Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="h-3 w-3 text-red-400" />
                  <span className="text-slate-300">{ev.location}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-400 font-semibold uppercase">Correlated Targets:</span>
                  {ev.entityNames.map((name, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      {name}
                    </span>
                  ))}
                  {ev.evidenceRef && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                      REF: {ev.evidenceRef}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Event Details Inspection Modal */}
      {inspectEvent && (
        <Dialog open={!!inspectEvent} onOpenChange={() => setInspectEvent(null)}>
          <DialogContent onClose={() => setInspectEvent(null)}>
            <DialogHeader>
              <DialogTitle>TIMELINE INTELLIGENCE CORRELATION</DialogTitle>
              <div className="text-xs text-slate-400">{inspectEvent.timestamp} • {inspectEvent.location}</div>
            </DialogHeader>
            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">{inspectEvent.title}</h3>
                <p className="mt-1 text-slate-300 leading-relaxed font-sans">{inspectEvent.description}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Correlated Operation:</span>
                  <span className="text-cyan-300 font-bold">{inspectEvent.caseId.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Confidence Score:</span>
                  <span className="text-emerald-400 font-bold">{inspectEvent.confidenceScore}% Corroborated</span>
                </div>
                {inspectEvent.evidenceRef && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Cryptographic Evidence Ref:</span>
                    <span className="text-amber-400 font-bold">{inspectEvent.evidenceRef}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">
                  Correlated Targets Present / Involved
                </span>
                <div className="flex flex-wrap gap-2">
                  {inspectEvent.entityNames.map((name, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="cyan" size="sm" onClick={() => setInspectEvent(null)}>
                  Close Inspection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
