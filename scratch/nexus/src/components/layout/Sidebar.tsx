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
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, badge: 'LIVE' },
    { to: '/upload', label: 'Upload Evidence', icon: UploadCloud, highlight: true },
    { to: '/network', label: 'Network Analysis', icon: Share2, badge: 'GRAPH' },
    { to: '/person/ent-1', label: 'Person Details', icon: UserCheck },
    { to: '/evidence/ev-1', label: 'Evidence Details', icon: FileText },
  ]

  return (
    <aside 
      className={cn(
        'relative flex flex-col border-r border-slate-800 bg-[#080d17] dark:bg-[#080d17] light:bg-slate-900 text-slate-200 transition-all duration-200 z-30 select-none h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Classification Tag */}
      <div className="border-b border-amber-900/60 bg-amber-950/40 px-3 py-1 text-center font-mono text-[9px] font-bold tracking-widest text-amber-400">
        {collapsed ? 'SIH-2026' : 'SPECIAL CELL // DELHI POLICE • SIH PROTOTYPE'}
      </div>

      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-4">
        {!collapsed ? (
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-cyan-950 border border-cyan-500/60 shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              <Shield className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono text-base font-black tracking-wider text-cyan-400">NEXUS</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">AI</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">Crime Network Analysis</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xs bg-cyan-950 border border-cyan-500/60">
            <Shield className="h-5 w-5 text-cyan-400" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'hidden lg:flex h-6 w-6 items-center justify-center rounded-xs border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white',
            collapsed && 'mx-auto mt-2'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Active Mission Pill */}
      {!collapsed && (
        <div className="m-3 p-2.5 rounded-xs border border-cyan-900/50 bg-cyan-950/20">
          <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1">
            <span className="flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">OPERATION</span>
            </span>
            <span className="text-slate-400">NCR-09</span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-100 truncate">CHAKRAVYUH</div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
            <span>Corridor: Delhi-NCR / UP</span>
            <span className="text-cyan-300 font-mono">12 Targets</span>
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
                'group flex items-center rounded-xs px-3 py-2.5 text-xs font-mono font-medium transition-all',
                isActive
                  ? 'border-l-2 border-cyan-400 bg-slate-800/80 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border-l-2 border-transparent'
              )
            }
          >
            <item.icon className={cn('h-4 w-4 shrink-0 transition-colors', collapsed ? 'mx-auto' : 'mr-3')} />
            {!collapsed && (
              <span className="flex-1 truncate tracking-wide">{item.label}</span>
            )}
            {!collapsed && item.badge && (
              <Badge variant={item.badge === 'LIVE' ? 'emerald' : 'cyan'} className="px-1.5 py-0 text-[9px]">
                {item.badge}
              </Badge>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Security Status Box */}
      {!collapsed ? (
        <div className="border-t border-slate-800 p-3 text-[11px] font-mono bg-[#060a12]">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>CDR & FASTag Net</span>
            </span>
            <span className="text-emerald-400">CONNECTED</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>INVESTIGATION MODE</span>
            <span className="text-cyan-400 font-semibold">INDIAN POLICE GRID</span>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-800 p-2 flex justify-center text-emerald-400">
          <Shield className="h-4 w-4" />
        </div>
      )}

      {/* Footer info */}
      <div className="border-t border-slate-800/80 bg-black/40 p-2 text-center text-[9px] font-mono text-slate-400">
        {!collapsed ? 'SMART INDIA HACKATHON 2026' : 'SIH'}
      </div>
    </aside>
  )
}
