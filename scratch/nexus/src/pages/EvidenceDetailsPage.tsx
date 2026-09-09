import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Copy, 
  Check, 
  Tag, 
  ExternalLink, 
  Phone, 
  Car, 
  DollarSign,
  Fingerprint,
  Share2,
  Calendar,
  Database
} from 'lucide-react'
import { mockEvidence, mockEntities } from '../data/mockData'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'

export const EvidenceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  // Find evidence item or fallback to first
  const evidence = mockEvidence.find(e => e.id === id) || mockEvidence[0]

  const copyHash = () => {
    navigator.clipboard.writeText(evidence.hashSHA256)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Linked persons
  const linkedPersons = mockEntities.filter(p => evidence.linkedEntityIds.includes(p.id))

  return (
    <div className="space-y-6 font-mono">
      {/* Evidence Switcher Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-800">
        <span className="text-[10px] uppercase text-slate-400 font-semibold shrink-0">Select Evidence File:</span>
        {mockEvidence.map(e => (
          <button
            key={e.id}
            onClick={() => navigate(`/evidence/${e.id}`)}
            className={cn(
              'px-2.5 py-1 rounded-xs text-[10px] whitespace-nowrap transition-colors border',
              e.id === evidence.id
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            )}
          >
            {e.evidenceNumber} ({e.city})
          </button>
        ))}
      </div>

      {/* Main Evidence Dossier Card */}
      <Card className="bg-[#0c121e] border-slate-800 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400 font-bold text-sm">{evidence.evidenceNumber}</span>
              <span className="text-slate-400 text-xs">•</span>
              <Badge variant="cyan">{evidence.type.toUpperCase()}</Badge>
              <Badge variant={evidence.classification.includes('SENSITIVE') ? 'critical' : 'routine'}>
                {evidence.classification}
              </Badge>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-100 font-sans mt-1">
              {evidence.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Link to="/network">
              <Button variant="tactical" size="sm" className="flex items-center space-x-1 h-8">
                <Share2 className="h-3.5 w-3.5" />
                <span>Locate on Graph</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Chain of Custody & Seizure Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-950 rounded border border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Seizure Location & City:</span>
            <span className="text-slate-200 font-bold flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
              {evidence.location} ({evidence.city})
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Custodial Officer & Badge:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              {evidence.collectedBy} ({evidence.badgeNumber})
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Collection Timestamp:</span>
            <span className="text-slate-200 font-bold flex items-center gap-1 mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              {evidence.dateCollected}
            </span>
          </div>
        </div>

        {/* AI Extraction Synthesis */}
        <div className="p-4 rounded bg-slate-900/90 border border-cyan-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <Fingerprint className="h-4 w-4 text-cyan-400" />
              AI Automated Information Extraction & NER
            </span>
            <Badge variant="emerald">VERIFIED BY SPECIAL CELL</Badge>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {evidence.aiSummary}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {evidence.aiExtractionTags.map((tag, i) => (
              <span key={i} className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-xs bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-semibold">
                <Tag className="h-3 w-3 mr-1 text-cyan-400" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Cryptographic SHA-256 Checksum */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="uppercase font-semibold">Digital Integrity Checksum (SHA-256 for Court Evidence)</span>
            <button
              onClick={copyHash}
              className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Hash'}</span>
            </button>
          </div>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] text-emerald-400 select-all font-mono break-all">
            {evidence.hashSHA256}
          </div>
        </div>

        {/* Linked Persons Grid */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-xs font-bold uppercase text-slate-300">
            Persons Linked to this Evidence Item ({linkedPersons.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {linkedPersons.map(person => (
              <div 
                key={person.id}
                onClick={() => navigate(`/person/${person.id}`)}
                className="p-3 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-100 text-xs">{person.name}</div>
                  <div className="text-[10px] text-cyan-400">{person.role} ({person.city})</div>
                  {person.phoneMasked && (
                    <div className="text-[10px] text-slate-400 mt-0.5">{person.phoneMasked}</div>
                  )}
                </div>
                <Badge variant={person.riskScore >= 85 ? 'critical' : 'high'}>
                  {person.riskScore}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
