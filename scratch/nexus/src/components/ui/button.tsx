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
          'inline-flex items-center justify-center rounded-sm text-xs font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider',
          {
            'bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700 shadow-sm': variant === 'default',
            'bg-red-600 text-white hover:bg-red-700 dark:bg-red-950/80 dark:text-red-300 dark:hover:bg-red-900 border border-red-600 dark:border-red-800/80 shadow-xs dark:shadow-threat': variant === 'destructive',
            'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white': variant === 'outline',
            'bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/50': variant === 'secondary',
            'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100': variant === 'ghost',
            'bg-cyan-50 text-cyan-900 border border-cyan-400/80 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-500/40 dark:hover:bg-cyan-900/60 dark:hover:border-cyan-400 shadow-xs dark:shadow-tactical': variant === 'tactical',
            'bg-cyan-600 text-white font-semibold hover:bg-cyan-500 border border-cyan-500 dark:bg-cyan-500 dark:text-black dark:hover:bg-cyan-400 dark:border-cyan-400 shadow-xs': variant === 'cyan',
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
