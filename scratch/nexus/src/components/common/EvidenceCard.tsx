import React, { useState } from 'react'
import { 
  FileText, 
  Headphones, 
  Video, 
  Database, 
  ShieldCheck, 
  Tag, 
  Fingerprint, 
  Copy, 
  Check, 
  ExternalLink,
  Eye
} from 'lucide-react'
import { Evidence } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { cn } from '../../lib/utils'

export const EvidenceCard: React.FC<{ evidence: Evidence; onInspect?: (e: Evidence) => void }> = ({
  evidence,
  onInspect,
}) => {
  const [copied, setCopied] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const copyHash = () => {
    navigator.clipboard.writeText(evidence.hashSHA256)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTypeIcon = () => {
    switch (evidence.type) {
      case 'wiretap':
        return <Headphones className="h-4 w-4 text-cyan-400" />
      case 'surveillance':
        return <Video className="h-4 w-4 text-amber-400" />
      case 'financial':
        return <Database className="h-4 w-4 text-emerald-400" />
      case 'forensics':
        return <Fingerprint className="h-4 w-4 text-purple-400" />
      default:
        return <FileText className="h-4 w-4 text-slate-400" />
    }
  }

  return (
    <>
      <Card className="hover:border-slate-700 transition-all font-mono group bg-[#0d1320]">
        <CardHeader className="p-3.5 pb-2 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-xs bg-slate-900 border border-slate-800">
                {getTypeIcon()}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100">{evidence.evidenceNumber}</span>
                <span className="text-[10px] text-slate-400 ml-2 uppercase">[{evidence.type}]</span>
              </div>
            </div>
            <Badge 
              variant={evidence.classification.includes('TOP SECRET') ? 'critical' : evidence.classification.includes('SECRET') ? 'high' : 'routine'}
              className="text-[8.5px] px-1.5 py-0"
            >
              {evidence.classification}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-3.5 space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed font-sans">
            {evidence.title}
          </h4>

          {/* AI extraction summary */}
          <div className="p-2 rounded-xs bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 font-sans leading-normal">
            <span className="text-cyan-400 font-mono font-bold text-[10px] uppercase block mb-0.5">
              AI NLP Synthesis:
            </span>
            {evidence.aiSummary}
          </div>

          {/* AI Extraction Tags */}
          <div className="flex flex-wrap gap-1">
            {evidence.aiExtractionTags.map((tag, i) => (
              <span key={i} className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-xs bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
                <Tag className="h-2.5 w-2.5 mr-1 text-cyan-400" />
                {tag}
              </span>
            ))}
          </div>

          {/* Custody telemetry */}
          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Custody Officer:</span>
              <span className="text-slate-300 font-semibold">{evidence.collectedBy} ({evidence.badgeNumber})</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Timestamp:</span>
              <span className="text-slate-300">{evidence.dateCollected}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Integrity Hash:</span>
              <button 
                onClick={copyHash}
                className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
                title="Copy SHA-256 Hash"
              >
                <span className="font-mono text-[9px] truncate w-28 text-right">
                  {evidence.hashSHA256.slice(0, 12)}...{evidence.hashSHA256.slice(-6)}
                </span>
                {copied ? <Check className="h-3 w-3 ml-1 text-emerald-400" /> : <Copy className="h-3 w-3 ml-1" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center justify-center space-x-1.5 h-7"
              onClick={() => setModalOpen(true)}
            >
              <Eye className="h-3 w-3" />
              <span>Inspect Raw Intercept</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Raw Intercept Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>EVIDENCE DOSSIER // {evidence.evidenceNumber}</DialogTitle>
            <div className="text-[10px] text-slate-400 font-mono">
              CASE: {evidence.caseName} • CLASSIFICATION: {evidence.classification}
            </div>
          </DialogHeader>
          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Title</div>
              <div className="text-slate-100 font-bold mt-0.5">{evidence.title}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">AI Neural Extraction</div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-200 mt-1 leading-relaxed">
                {evidence.aiSummary}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded border border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 block">File Name:</span>
                <span className="text-cyan-300 font-bold">{evidence.fileDetails.filename}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Format & Size:</span>
                <span className="text-slate-200">{evidence.fileDetails.format} ({evidence.fileDetails.size})</span>
              </div>
              <div>
                <span className="text-slate-400 block">Collection Location:</span>
                <span className="text-slate-200">{evidence.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Chain of Custody Badge:</span>
                <span className="text-emerald-400 font-bold">{evidence.badgeNumber}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-1">SHA-256 Checksum</span>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] text-emerald-400 break-all select-all">
                {evidence.hashSHA256}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
