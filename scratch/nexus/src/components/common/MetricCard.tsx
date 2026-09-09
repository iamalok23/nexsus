import React from 'react'
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'
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
  className
}) => {
  // Normalize sparkline points to SVG polygon coordinates (width 80, height 28)
  const min = Math.min(...sparkline)
  const max = Math.max(...sparkline)
  const range = max - min || 1
  const width = 80
  const height = 26
  
  const points = sparkline
    .map((val, idx) => {
      const x = (idx / (sparkline.length - 1)) * width
      const y = height - ((val - min) / range) * height + 2
      return `${x},${y}`
    })
    .join(' ')

  const threatBorderColors = {
    critical: 'border-l-4 border-l-red-500 hover:border-red-500/80',
    high: 'border-l-4 border-l-amber-500 hover:border-amber-500/80',
    neutral: 'border-l-4 border-l-cyan-500 hover:border-cyan-500/80',
    secure: 'border-l-4 border-l-emerald-500 hover:border-emerald-500/80',
  }

  const sparklineColors = {
    critical: '#ef4444',
    high: '#f59e0b',
    neutral: '#06b6d4',
    secure: '#10b981',
  }

  return (
    <Card className={cn('relative overflow-hidden transition-all bg-[#0d1422] border-slate-800/80', threatBorderColors[threat], className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">{title}</span>
          <Badge 
            variant={threat === 'critical' ? 'critical' : threat === 'high' ? 'high' : threat === 'secure' ? 'emerald' : 'cyan'}
            className="text-[9px] px-1.5 py-0"
          >
            {threat.toUpperCase()}
          </Badge>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <div className="font-mono text-2xl font-bold tracking-tight text-slate-100">
            {value}
          </div>
          
          {/* Sparkline visualization */}
          <div className="w-20 h-7">
            <svg viewBox={`0 0 ${width} ${height + 4}`} className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke={sparklineColors[threat]}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        </div>

        <div className="mt-2 flex items-center space-x-2 text-[11px] font-mono">
          <span className={cn(
            'flex items-center space-x-0.5 font-semibold',
            trend === 'up' && threat === 'critical' ? 'text-red-400' :
            trend === 'up' ? 'text-cyan-400' :
            trend === 'down' ? 'text-emerald-400' : 'text-slate-400'
          )}>
            {trend === 'up' && <TrendingUp className="h-3 w-3 inline mr-0.5" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 inline mr-0.5" />}
            {trend === 'neutral' && <Minus className="h-3 w-3 inline mr-0.5" />}
            <span>{change}</span>
          </span>

          {subtext && (
            <>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400 truncate">{subtext}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
