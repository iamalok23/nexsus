import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  UploadCloud, 
  Share2, 
  UserCheck, 
  FileText,
  ChevronLeft, 
  ChevronRight,
  Shield,
  Radio
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Badge } from '../ui/badge'

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)

  // 5 Main screens requested for Smart India Hackathon
  const navItems = [
    { to: '/', label: 'Dashboard Deck', icon: LayoutDashboard, badge: 'LIVE' },
    { to: '/upload', label: 'Ingest Evidence', icon: UploadCloud, highlight: true },
    { to: '/network', label: 'Network Analysis', icon: Share2, badge: 'GRAPH' },
    { to: '/person/ent-1', label: 'Target Dossiers', icon: UserCheck },
    { to: '/evidence/ev-1', label: 'Evidence Vault', icon: FileText },
  ]

  return (
    <aside 
      className={cn(
        'relative flex flex-col border-r border-slate-300 dark:border-cyan-500/20 bg-white/95 dark:bg-[#060a14] text-slate-800 dark:text-slate-200 transition-all duration-200 z-30 select-none h-screen sticky top-0 backdrop-blur-xl',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Classification Tag */}
      <div className="border-b border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-center font-mono text-[9px] font-bold tracking-widest text-amber-800 dark:text-amber-400">
        {collapsed ? 'SIH' : 'SPECIAL CELL // DELHI POLICE • SIH-2026'}
      </div>

      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-4 py-3.5">
        {!collapsed ? (
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-slate-100 dark:bg-[#03060c] border border-cyan-600/40 dark:border-cyan-500/60 shadow-xs dark:shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <Shield className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono text-base font-black tracking-wider text-slate-900 dark:text-white">NEXUS</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/50 text-cyan-800 dark:text-cyan-300 font-bold">
                  GRID
                </span>
              </div>
              <p className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-tight">Intelligence Terminal</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xs bg-slate-100 dark:bg-[#03060c] border border-cyan-600/40 dark:border-cyan-500/60 shadow-xs">
            <Shield className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'hidden lg:flex h-6 w-6 items-center justify-center rounded-xs border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#040812] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors',
            collapsed && 'mx-auto mt-2'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Active Mission Pill */}
      {!collapsed && (
        <div className="m-3 p-2.5 rounded-xs border border-slate-300 dark:border-cyan-500/30 bg-slate-50 dark:bg-[#040812]/90 shadow-xs tactical-corner">
          <div className="flex items-center justify-between text-[10px] font-mono text-cyan-700 dark:text-cyan-400 mb-1">
            <span className="flex items-center space-x-1.5 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>OPERATION</span>
            </span>
            <span className="text-slate-500 dark:text-slate-400">NCR-09</span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 dark:text-white tracking-wider truncate">
            CHAKRAVYUH
          </div>
          <div className="text-[9.5px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-1 pt-1 border-t border-slate-200 dark:border-slate-800/80">
            <span>Corridor: Delhi-NCR / UP</span>
            <span className="text-cyan-700 dark:text-cyan-300 font-mono font-semibold">12 Targets</span>
          </div>
        </div>
      )}

      {/* 5 Main Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-2 py-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-xs px-3 py-2.5 text-xs font-mono font-medium transition-all duration-150',
                isActive
                  ? 'border-l-2 border-cyan-600 dark:border-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 border-l-2 border-transparent'
              )
            }
          >
            <item.icon className={cn('h-4 w-4 shrink-0 transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400', collapsed ? 'mx-auto' : 'mr-3')} />
            {!collapsed && (
              <span className="flex-1 truncate tracking-wide">{item.label}</span>
            )}
            {!collapsed && item.badge && (
              <Badge 
                variant={item.badge === 'LIVE' ? 'emerald' : 'cyan'} 
                className="px-1.5 py-0 text-[9px] tracking-wider"
              >
                {item.badge}
              </Badge>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Security Telemetry Status Box */}
      {!collapsed ? (
        <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 text-[10.5px] font-mono bg-slate-50 dark:bg-[#03060c]">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>CDR & FASTag Net</span>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">CONNECTED</span>
          </div>
          <div className="text-[9.5px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>GRID SYSTEM</span>
            <span className="text-cyan-700 dark:text-cyan-400 font-semibold">INDIAN POLICE CDR-L1</span>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-200 dark:border-slate-800 p-2 flex justify-center text-emerald-600 dark:text-emerald-400">
          <Radio className="h-4 w-4 animate-pulse" />
        </div>
      )}

      {/* Footer info */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-black/40 p-2 text-center text-[9px] font-mono text-slate-500 dark:text-slate-400">
        {!collapsed ? 'DEFENSE COMMAND TERMINAL • SIH 2026' : 'SIH'}
      </div>
    </aside>
  )
}
