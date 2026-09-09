import React, { createContext, useContext, useState } from 'react'
import { cn } from '../../lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

export function Tabs({ defaultValue, value, onValueChange, className, children, ...props }: TabsProps) {
  const [currentTab, setCurrentTab] = useState(value || defaultValue || '')
  
  const handleTabChange = (val: string) => {
    if (onValueChange) onValueChange(val)
    else setCurrentTab(val)
  }

  const activeValue = value !== undefined ? value : currentTab

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleTabChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex h-9 items-center justify-start rounded-xs bg-slate-900/90 p-1 text-slate-400 border border-slate-800 light:bg-slate-100 light:border-slate-300',
        className
      )}
      {...props}
    />
  )
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used inside Tabs')

  const isActive = context.value === value

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs font-mono font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider',
        isActive
          ? 'bg-slate-800 text-cyan-300 border-b-2 border-cyan-400 shadow-sm light:bg-white light:text-slate-900'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 light:text-slate-600',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used inside Tabs')

  if (context.value !== value) return null

  return (
    <div className={cn('mt-3 focus-visible:outline-none', className)} {...props}>
      {children}
    </div>
  )
}
