import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  User, 
  Building2, 
  MapPin, 
  AlertTriangle, 
  Share2, 
  FileText, 
  ShieldAlert 
} from 'lucide-react'
import { Entity } from '../../types'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

export const EntityCard: React.FC<{ entity: Entity }> = ({ entity }) => {
  const navigate = useNavigate()

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'text-red-400 bg-red-950/70 border-red-800/80'
    if (score >= 75) return 'text-amber-400 bg-amber-950/70 border-amber-800/80'
    return 'text-cyan-400 bg-cyan-950/70 border-cyan-800/80'
  }

  return (
    <Card className="hover:border-slate-700 transition-all font-mono group bg-[#0d1320] overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          {/* Avatar or Icon */}
          <div className="relative">
            {entity.photo ? (
              <img
                src={entity.photo}
                alt={entity.name}
                className="h-14 w-14 rounded-xs object-cover border border-slate-700 grayscale contrast-125 group-hover:grayscale-0 transition-all"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xs bg-slate-900 border border-slate-800 text-cyan-400">
                {entity.type === 'shell_company' ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-xs bg-black/90 border border-slate-700 text-[8px] font-bold text-slate-300 uppercase">
              {entity.type.slice(0, 3)}
            </span>
          </div>

          {/* Risk Gauge Pill */}
          <div className="text-right">
            <div className={cn('px-2 py-0.5 rounded-xs border text-[10px] font-bold tracking-wider uppercase', getRiskColor(entity.riskScore))}>
              THREAT {entity.riskScore}/100
            </div>
            <div className="mt-1">
              <Badge 
                variant={entity.status.includes('Warrant') ? 'critical' : entity.status.includes('Surveillance') ? 'amber' : 'cyan'}
                className="text-[8.5px] px-1.5 py-0"
              >
                {entity.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Identity & Affiliation */}
        <div>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
            {entity.name}
          </h3>
          <p className="text-[11px] text-cyan-400/90 truncate font-semibold mt-0.5">
            {entity.role}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {entity.primaryAffiliation}
          </p>
        </div>

        {/* Aliases */}
        {entity.aliases.length > 0 && (
          <div className="text-[10px] text-slate-400">
            <span className="text-slate-400 uppercase font-semibold">Aliases: </span>
            <span className="text-slate-300">{entity.aliases.slice(0, 2).join(', ')}</span>
            {entity.aliases.length > 2 && <span className="text-slate-400"> (+{entity.aliases.length - 2})</span>}
          </div>
        )}

        {/* Last Location */}
        <div className="flex items-center text-[10px] text-slate-400 truncate border-t border-slate-800/80 pt-2">
          <MapPin className="h-3 w-3 mr-1 text-red-400 shrink-0" />
          <span className="truncate">{entity.lastKnownLocation.name}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link to={`/entity/${entity.id}`}>
            <Button variant="outline" size="sm" className="w-full h-7 text-[10px] flex items-center justify-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>Dossier</span>
            </Button>
          </Link>
          <Button 
            variant="tactical" 
            size="sm" 
            className="w-full h-7 text-[10px] flex items-center justify-center space-x-1"
            onClick={() => navigate('/network')}
          >
            <Share2 className="h-3 w-3" />
            <span>Graph</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
