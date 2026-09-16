import React, { useState, useEffect } from 'react'
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
  Database,
  RefreshCw,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { mockEvidence, mockEntities } from '../data/mockData'
import { Evidence } from '../types'
import { api } from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'

export const EvidenceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  
  const [evidenceList, setEvidenceList] = useState<Evidence[]>(mockEvidence)
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load evidence list for switcher and fetch target evidence
  useEffect(() => {
    let isMounted = true
    const loadEvidenceData = async () => {
      setLoading(true)
      setError(null)

      let currentList = mockEvidence
      try {
        const remoteList = await api.getEvidenceList()
        if (remoteList && remoteList.length > 0) {
          currentList = remoteList
          if (isMounted) setEvidenceList(remoteList)
        }
      } catch (listErr) {
        console.warn('Unable to load remote evidence list, using local fallback:', listErr)
      }

      const targetId = id || (currentList.length > 0 ? currentList[0].id : 'ev-1')

      try {
        const remoteItem = await api.getEvidence(targetId)
        if (isMounted && remoteItem) {
          setEvidence(remoteItem)
          setLoading(false)
          return
        }
      } catch (itemErr) {
        console.warn(`Remote fetch for evidence ${targetId} failed, checking local fallback:`, itemErr)
      }

      // Local fallback lookup
      const localMatch = currentList.find(e => e.id === targetId || e.evidenceNumber === targetId) ||
        mockEvidence.find(e => e.id === targetId || e.evidenceNumber === targetId)

      if (isMounted) {
        if (localMatch) {
          setEvidence(localMatch)
        } else {
          setError(`Evidence dossier with ID '${targetId}' was not found.`)
        }
        setLoading(false)
      }
    }

    loadEvidenceData()
    return () => { isMounted = false }
  }, [id])

  const copyHash = () => {
    if (!evidence) return
    navigator.clipboard.writeText(evidence.hashSHA256)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Linked persons
  const linkedPersons = evidence 
    ? mockEntities.filter(p => evidence.linkedEntityIds?.includes(p.id) || evidence.linkedEntityIds?.includes(p.name))
    : []

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 font-mono">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        <div className="text-sm font-bold text-slate-200 tracking-wider">
          RETRIEVING CLASSIFIED EVIDENCE RECORD // {id || 'DEFAULT'}
        </div>
        <p className="text-xs text-slate-400">Verifying SHA-256 hash & decrypting chain-of-custody dossier...</p>
      </div>
    )
  }

  if (error || !evidence) {
    return (
      <div className="space-y-6 font-mono max-w-2xl mx-auto mt-10">
        <div className="p-8 border border-red-800/80 bg-[#0d1320] rounded-xs space-y-4 text-center">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-red-200 uppercase tracking-wide">
            EVIDENCE RECORD NOT FOUND
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            No verified evidence item matching identifier <span className="text-cyan-300 font-bold font-mono">"{id}"</span> could be found in the SQLite investigation vault.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/upload')}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back to Evidence Vault
            </Button>
            {evidenceList.length > 0 && (
              <Button variant="cyan" size="sm" onClick={() => navigate(`/evidence/${evidenceList[0].id}`)}>
                Open Available Evidence ({evidenceList[0].evidenceNumber})
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Evidence Switcher Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-800">
        <span className="text-[10px] uppercase text-slate-400 font-semibold shrink-0">Select Evidence File:</span>
        {evidenceList.map(e => (
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
            {e.evidenceNumber} ({e.city || 'NCR'})
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
