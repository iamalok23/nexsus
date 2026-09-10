import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShieldAlert, 
  Radio, 
  Camera, 
  Cpu, 
  ExternalLink, 
  CheckCircle2, 
  ArrowUpRight,
  MapPin
} from 'lucide-react'
import { ThreatAlert } from '../../types'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

export const AlertCard: React.FC<{ alert: ThreatAlert; onDismiss?: (id: string) => void }> = ({
  alert,
  onDismiss,
}) => {
  const navigate = useNavigate()
  const [acknowledged, setAcknowledged] = useState(alert.isRead)

  const getSourceIcon = () => {
    switch (alert.source) {
      case 'CDR CLUSTER':
        return <Radio className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
      case 'FASTag ANPR':
        return <Camera className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      case 'BANK / UPI FLAGGED':
        return <ShieldAlert className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      case 'AI PATTERN ENGINE':
        return <Cpu className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
      default:
        return <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
    }
  }

  const borderClass = 
    alert.level === 'CRITICAL' 
      ? 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-[#0c121e]/90 hover:border-red-600 dark:hover:border-red-500/80 shadow-xs dark:shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
      : alert.level === 'HIGH' 
      ? 'border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-[#0c121e]/90 hover:border-amber-600 dark:hover:border-amber-500/80 shadow-xs dark:shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
      : 'border-l-4 border-l-cyan-500 bg-cyan-50/50 dark:bg-[#0c121e]/90 hover:border-cyan-600 dark:hover:border-cyan-500/80'

  return (
    <Card className={cn('relative overflow-hidden tactical-panel transition-all font-mono group', borderClass, acknowledged && 'opacity-60')}>
      <CardContent className="p-3.5 space-y-2.5">
        {/* Source & Severity Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              {getSourceIcon()}
              <span>{alert.source}</span>
            </div>
            <span className="text-slate-400 text-[10px]">•</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">{alert.timestamp}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Badge 
              variant={alert.level === 'CRITICAL' ? 'critical' : alert.level === 'HIGH' ? 'high' : 'cyan'}
              className="text-[9px] px-1.5 py-0 tabular-nums"
            >
              {alert.level}
            </Badge>
            <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-bold tabular-nums">
              {alert.confidence}% CONF
            </span>
          </div>
        </div>

        {/* Title & Body */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors font-sans tracking-tight">
            {alert.title}
          </h4>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-sans">
            {alert.description}
          </p>
        </div>

        {/* Metadata Links */}
        {(alert.relatedEntityName || alert.city) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
            {alert.relatedEntityName && (
              <button
                onClick={() => alert.relatedEntityId && navigate(`/person/${alert.relatedEntityId}`)}
                className="flex items-center space-x-1 text-cyan-800 dark:text-cyan-400 hover:underline bg-cyan-100 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded-xs border border-cyan-300 dark:border-cyan-800/60 transition-colors"
              >
                <span>TARGET: {alert.relatedEntityName}</span>
                <ArrowUpRight className="h-2.5 w-2.5" />
              </button>
            )}
            {alert.city && (
              <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#040812] px-1.5 py-0.5 rounded-xs border border-slate-300 dark:border-slate-800">
                <MapPin className="h-2.5 w-2.5 text-red-500 dark:text-red-400 shrink-0" />
                <span>{alert.city}</span>
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px]">
          <button
            onClick={() => setAcknowledged(!acknowledged)}
            className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <CheckCircle2 className={cn('h-3.5 w-3.5', acknowledged ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400')} />
            <span>{acknowledged ? 'REVIEWED' : 'MARK REVIEWED'}</span>
          </button>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
            onClick={() => navigate('/network')}
          >
            <span>PLOT IN GRAPH</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
