import React from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'critical' | 'high' | 'elevated' | 'routine' | 'outline' | 'cyan' | 'emerald' | 'amber'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xs border px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase transition-colors focus:outline-none',
        {
          'border-slate-700 bg-slate-800 text-slate-300': variant === 'default',
          'border-red-600/60 bg-red-950/70 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.25)]': variant === 'critical',
          'border-amber-600/60 bg-amber-950/70 text-amber-300': variant === 'high',
          'border-cyan-600/60 bg-cyan-950/70 text-cyan-300': variant === 'elevated',
          'border-slate-700/60 bg-slate-900/60 text-slate-400': variant === 'routine',
          'border-cyan-500/50 bg-cyan-950/40 text-cyan-300': variant === 'cyan',
          'border-emerald-500/50 bg-emerald-950/40 text-emerald-300': variant === 'emerald',
          'border-amber-500/50 bg-amber-950/40 text-amber-300': variant === 'amber',
          'border-slate-600 text-slate-300': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}
