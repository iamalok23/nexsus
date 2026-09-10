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
          'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300': variant === 'default',
          'border-red-300 bg-red-100 text-red-800 dark:border-red-600/60 dark:bg-red-950/70 dark:text-red-300 dark:shadow-[0_0_8px_rgba(239,68,68,0.25)]': variant === 'critical',
          'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-600/60 dark:bg-amber-950/70 dark:text-amber-300': variant === 'high',
          'border-cyan-300 bg-cyan-100 text-cyan-800 dark:border-cyan-600/60 dark:bg-cyan-950/70 dark:text-cyan-300': variant === 'elevated',
          'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400': variant === 'routine',
          'border-cyan-300 bg-cyan-100 text-cyan-900 dark:border-cyan-500/50 dark:bg-cyan-950/40 dark:text-cyan-300': variant === 'cyan',
          'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-300': variant === 'emerald',
          'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-300': variant === 'amber',
          'border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}
