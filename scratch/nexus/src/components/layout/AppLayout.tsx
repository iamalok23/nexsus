import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#070b12] text-slate-100 dark:bg-[#070b12] light:bg-slate-50 light:text-slate-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 tactical-grid">
          <Outlet />
        </main>
        {/* Persistent bottom telemetry classification bar */}
        <footer className="h-6 border-t border-slate-800/80 bg-[#05080f] px-4 flex items-center justify-between font-mono text-[9px] text-slate-400 select-none">
          <div className="flex items-center space-x-3">
            <span className="text-cyan-400 font-semibold">NEXUS v3.4.1</span>
            <span className="hidden sm:inline">DATABASE: POSTGRES-LEO-SYNAPSE</span>
            <span className="hidden md:inline">SYSTEM LATENCY: 18ms</span>
          </div>
          <div className="text-amber-400/90 font-bold tracking-widest uppercase">
            LAW ENFORCEMENT SENSITIVE // DISSEMINATION RESTRICTED TO AUTHORIZED PERSONNEL ONLY
          </div>
        </footer>
      </div>
    </div>
  )
}
