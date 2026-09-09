import React from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'tactical' | 'cyan'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-sm text-xs font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider',
          {
            'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 shadow-sm': variant === 'default',
            'bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-800/80 shadow-threat': variant === 'destructive',
            'border border-slate-700 bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white': variant === 'outline',
            'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50': variant === 'secondary',
            'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100': variant === 'ghost',
            'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60 hover:border-cyan-400 shadow-tactical': variant === 'tactical',
            'bg-cyan-500 text-black font-semibold hover:bg-cyan-400 border border-cyan-400': variant === 'cyan',
            'h-9 px-3.5 py-2': size === 'default',
            'h-7 px-2.5 text-[11px]': size === 'sm',
            'h-11 px-6 text-sm': size === 'lg',
            'h-8 w-8 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
