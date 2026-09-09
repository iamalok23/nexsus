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
        return <Radio className="h-3.5 w-3.5 text-cyan-400" />
      case 'FASTag ANPR':
        return <Camera className="h-3.5 w-3.5 text-amber-400" />
      case 'BANK / UPI FLAGGED':
        return <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
      case 'AI PATTERN ENGINE':
        return <Cpu className="h-3.5 w-3.5 text-purple-400" />
      default:
        return <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
    }
  }

  const borderClass = 
    alert.level === 'CRITICAL' ? 'border-l-4 border-l-red-500 bg-red-950/10' :
    alert.level === 'HIGH' ? 'border-l-4 border-l-amber-500 bg-amber-950/10' :
    'border-l-4 border-l-cyan-500 bg-cyan-950/10'

  return (
    <Card className={cn('hover:border-slate-700 transition-all font-mono group bg-[#0c121e]', borderClass, acknowledged && 'opacity-70')}>
      <CardContent className="p-3.5 space-y-2.5">
        {/* Source & Severity Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-300 uppercase">
              {getSourceIcon()}
              <span>{alert.source}</span>
            </div>
            <span className="text-slate-400 text-[10px]">•</span>
            <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Badge 
              variant={alert.level === 'CRITICAL' ? 'critical' : alert.level === 'HIGH' ? 'high' : 'cyan'}
              className="text-[9px] px-1.5 py-0"
            >
              {alert.level}
            </Badge>
            <span className="text-[10px] text-cyan-400 font-bold">
              {alert.confidence}% CONF
            </span>
          </div>
        </div>

        {/* Title & Body */}
        <div>
          <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors font-sans">
            {alert.title}
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
            {alert.description}
          </p>
        </div>

        {/* Metadata Links */}
        {(alert.relatedEntityName || alert.city) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
            {alert.relatedEntityName && (
              <button
                onClick={() => alert.relatedEntityId && navigate(`/person/${alert.relatedEntityId}`)}
                className="flex items-center space-x-1 text-cyan-400 hover:underline bg-cyan-950/50 px-1.5 py-0.5 rounded-xs border border-cyan-900/60"
              >
                <span>Target: {alert.relatedEntityName}</span>
                <ArrowUpRight className="h-2.5 w-2.5" />
              </button>
            )}
            {alert.city && (
              <span className="flex items-center space-x-1 text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded-xs border border-slate-800">
                <MapPin className="h-2.5 w-2.5 text-red-400" />
                <span>{alert.city}</span>
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
          <button
            onClick={() => setAcknowledged(!acknowledged)}
            className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <CheckCircle2 className={cn('h-3.5 w-3.5', acknowledged ? 'text-emerald-400' : 'text-slate-400')} />
            <span>{acknowledged ? 'Acknowledged' : 'Mark Reviewed'}</span>
          </button>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-cyan-400 hover:text-cyan-300"
            onClick={() => navigate('/network')}
          >
            <span>Plot in Graph</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
