import React, { useId } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'

export interface MetricCardProps {
  title: string
  value: string | number
  change: string
  trend?: 'up' | 'down' | 'neutral'
  threat?: 'critical' | 'high' | 'neutral' | 'secure'
  subtext?: string
  sparkline?: number[]
  channelId?: string
  confidence?: string
  latency?: string
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  threat = 'neutral',
  subtext,
  sparkline = [20, 35, 45, 30, 55, 70, 85],
  channelId,
  confidence,
  latency,
  className
}) => {
  const gradientId = useId().replace(/:/g, '')

  // Calculate SVG sparkline points
  const min = Math.min(...sparkline)
  const max = Math.max(...sparkline)
  const range = max - min || 1
  const width = 110
  const height = 36
  const padding = 4

  const points = sparkline.map((val, idx) => {
    const x = padding + (idx / (sparkline.length - 1)) * (width - padding * 2)
    const y = height - padding - ((val - min) / range) * (height - padding * 2)
    return { x, y }
  })

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ')
  
  // Create smooth filled polygon under sparkline
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const fillPolygonPoints = `${firstPoint.x},${height} ${polylinePoints} ${lastPoint.x},${height}`

  // Threat configuration with light & dark mode support
  const threatConfigs = {
    critical: {
      border: 'border-red-300 dark:border-red-500/40 hover:border-red-500 dark:hover:border-red-500/80 shadow-xs dark:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
      glow: 'from-red-500/20 to-transparent',
      stroke: '#dc2626',
      strokeDark: '#ef4444',
      badgeVariant: 'critical' as const,
      pulseBg: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      accentCorner: 'tactical-corner-threat',
      channelPrefix: 'SIG-CRIT',
      confDefault: '96.4%',
      latencyDefault: '14ms',
    },
    high: {
      border: 'border-amber-300 dark:border-amber-500/40 hover:border-amber-500 dark:hover:border-amber-500/80 shadow-xs dark:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      glow: 'from-amber-500/20 to-transparent',
      stroke: '#d97706',
      strokeDark: '#f59e0b',
      badgeVariant: 'high' as const,
      pulseBg: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      accentCorner: 'tactical-corner-amber',
      channelPrefix: 'SIG-ELEV',
      confDefault: '91.2%',
      latencyDefault: '19ms',
    },
    neutral: {
      border: 'border-cyan-300 dark:border-cyan-500/30 hover:border-cyan-500 dark:hover:border-cyan-500/70 shadow-xs dark:shadow-[0_0_20px_rgba(6,182,212,0.12)]',
      glow: 'from-cyan-500/15 to-transparent',
      stroke: '#0284c7',
      strokeDark: '#06b6d4',
      badgeVariant: 'cyan' as const,
      pulseBg: 'bg-cyan-500',
      textColor: 'text-cyan-700 dark:text-cyan-400',
      accentCorner: 'tactical-corner',
      channelPrefix: 'TEL-GRID',
      confDefault: '98.0%',
      latencyDefault: '22ms',
    },
    secure: {
      border: 'border-emerald-300 dark:border-emerald-500/30 hover:border-emerald-500 dark:hover:border-emerald-500/70 shadow-xs dark:shadow-[0_0_20px_rgba(16,185,129,0.12)]',
      glow: 'from-emerald-500/15 to-transparent',
      stroke: '#059669',
      strokeDark: '#10b981',
      badgeVariant: 'emerald' as const,
      pulseBg: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      accentCorner: 'tactical-corner',
      channelPrefix: 'SEC-GRID',
      confDefault: '99.5%',
      latencyDefault: '16ms',
    },
  }

  const currentThreat = threatConfigs[threat]

  return (
    <Card 
      className={cn(
        'relative overflow-hidden tactical-panel transition-all duration-300 group',
        currentThreat.accentCorner,
        currentThreat.border,
        className
      )}
    >
      {/* Top Threat Accent Glow Line */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r', currentThreat.glow)} />

      <CardContent className="p-4 space-y-2.5">
        {/* Header Telemetry Band */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', currentThreat.pulseBg)} />
            <span className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              {channelId || `${currentThreat.channelPrefix} // ${title.split(' ')[0].toUpperCase()}`}
            </span>
          </div>

          <Badge 
            variant={currentThreat.badgeVariant}
            className="text-[9px] font-mono px-1.5 py-0 tracking-wider shadow-xs"
          >
            {threat.toUpperCase()}
          </Badge>
        </div>

        {/* Metric Value & Live Sparkline */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {title}
            </div>
            <div className="font-mono text-2xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums flex items-baseline gap-1 mt-0.5">
              <span>{value}</span>
            </div>
          </div>

          {/* Glowing Tactical Sparkline */}
          <div className="w-28 h-9 shrink-0">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id={`grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentThreat.stroke} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={currentThreat.stroke} stopOpacity="0.0" />
                </linearGradient>
                <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Gradient Area Fill */}
              <polygon
                points={fillPolygonPoints}
                fill={`url(#grad-${gradientId})`}
              />

              {/* Glowing Line */}
              <polyline
                fill="none"
                stroke={currentThreat.stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#glow-${gradientId})`}
                points={polylinePoints}
              />

              {/* Pulsing Beacon on Latest Data Point */}
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r="3"
                fill={currentThreat.stroke}
                className="animate-pulse"
              />
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r="6"
                fill="none"
                stroke={currentThreat.stroke}
                strokeWidth="1"
                opacity="0.5"
              />
            </svg>
          </div>
        </div>

        {/* Micro-Data Telemetry Bar */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center space-x-1">
            <span className={cn(
              'flex items-center font-bold',
              trend === 'up' && threat === 'critical' ? 'text-red-600 dark:text-red-400' :
              trend === 'up' ? 'text-cyan-700 dark:text-cyan-400' :
              trend === 'down' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
            )}>
              {trend === 'up' && <TrendingUp className="h-3 w-3 inline mr-0.5 shrink-0" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 inline mr-0.5 shrink-0" />}
              {trend === 'neutral' && <Minus className="h-3 w-3 inline mr-0.5 shrink-0" />}
              <span className="truncate max-w-[130px]">{change}</span>
            </span>
          </div>

          {/* Micro indicators: Confidence & Latency */}
          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 tabular-nums">
            <span>CONF:</span>
            <span className="text-cyan-700 dark:text-cyan-300 font-semibold">{confidence || currentThreat.confDefault}</span>
            <span>•</span>
            <span>{latency || currentThreat.latencyDefault}</span>
          </div>
        </div>

        {/* Subtext description */}
        {subtext && (
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate pt-0.5">
            {subtext}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
