import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const AppLayout: React.FC = () => {
  const { currentUser, loading } = useAuth()

  // Guard: Do not render layout shell or dashboard chrome if unauthenticated
  if (loading || !currentUser) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-[#050913] dark:text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-900 dark:selection:text-cyan-200 transition-colors duration-200">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 tactical-grid">
          <Outlet />
        </main>
        {/* Persistent bottom telemetry ops bar */}
        <footer className="h-7 border-t border-slate-300 dark:border-cyan-500/20 bg-white/90 dark:bg-[#03060c] px-4 flex items-center justify-between font-mono text-[9px] text-slate-600 dark:text-slate-400 select-none transition-colors">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse" />
              <span>NEXUS TACTICAL v4.2.0</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-700 dark:text-slate-300">
              NETWORKX IN-MEMORY ENGINE // 15 SYNDICATE EDGES
            </span>
            <span className="text-slate-400 hidden md:inline">•</span>
            <span className="hidden md:inline text-slate-600 dark:text-slate-400">
              DATASET: OPERATION CHAKRAVYUH (SYNTHETIC ETHICAL PROTOTYPE)
            </span>
          </div>

          <div className="flex items-center space-x-3 text-amber-700 dark:text-amber-400/90 font-bold tracking-widest uppercase">
            <ShieldAlert className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-none">
              LAW ENFORCEMENT SENSITIVE // AUTHORIZED PERSONNEL ONLY
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
