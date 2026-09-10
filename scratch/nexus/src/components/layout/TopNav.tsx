import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  ShieldAlert, 
  Shield, 
  LogOut, 
  X,
  MapPin,
  Car,
  Phone,
  Clock
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { mockAlerts, mockEntities } from '../../data/mockData'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { api, HealthResponse } from '../../lib/api'

export const TopNav: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false)
  const [utcTime, setUtcTime] = useState('')
  const [istTime, setIstTime] = useState('')
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null)
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [latencyMs, setLatencyMs] = useState<number | null>(null)

  // Real-time ticking clock for UTC & IST
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date()
      
      // UTC Time
      const utcString = now.toUTCString().slice(17, 25) + ' UTC'
      setUtcTime(utcString)

      // IST Time (UTC + 5:30)
      const istOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }
      const istFormatted = new Intl.DateTimeFormat('en-GB', istOptions).format(now) + ' IST'
      setIstTime(istFormatted)
    }

    updateClocks()
    const timer = setInterval(updateClocks, 1000)
    return () => clearInterval(timer)
  }, [])

  // Check live backend sync status
  useEffect(() => {
    const checkSync = async () => {
      const start = Date.now()
      try {
        const res = await api.getHealth()
        const elapsed = Date.now() - start
        setLatencyMs(elapsed)
        setBackendHealth(res)
        setBackendStatus('online')
      } catch {
        setBackendStatus('offline')
        setLatencyMs(null)
      }
    }

    checkSync()
    const syncInterval = setInterval(checkSync, 30000)
    return () => clearInterval(syncInterval)
  }, [])

  const unreadAlerts = mockAlerts.filter(a => !a.isRead)

  // Search filtering across Indian names, vehicles, phones, and cities
  const matchingEntities = searchQuery.trim() 
    ? mockEntities.filter(e => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (e.aliases && e.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (e.vehicleNumber && e.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.phoneMasked && e.phoneMasked.includes(searchQuery)) ||
        (e.city && e.city.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : []

  const handleSelectEntity = (id: string) => {
    navigate(`/person/${id}`)
    setShowSearchResults(false)
    setSearchQuery('')
  }

  return (
    <header className="sticky top-0 z-40 w-full flex flex-col border-b border-slate-300 dark:border-cyan-500/20 bg-white/95 dark:bg-[#060b14]/95 backdrop-blur-md select-none transition-colors duration-200">
      {/* 1. Classified Ops Ribbon */}
      <div className="h-5 bg-slate-100 dark:bg-[#03060c] border-b border-slate-200 dark:border-slate-800/80 px-4 flex items-center justify-between text-[8.5px] font-mono text-slate-600 dark:text-slate-400 tracking-wider">
        <div className="flex items-center space-x-2">
          <span className="text-amber-700 dark:text-amber-400 font-bold tracking-widest uppercase flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-xs animate-pulse" />
            TOP SECRET // LAW ENFORCEMENT SENSITIVE
          </span>
          <span className="text-slate-400">•</span>
          <span className="hidden sm:inline">DISSEMINATION RESTRICTED TO AUTHORIZED POLICE COMMAND</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="hidden md:inline text-cyan-700 dark:text-cyan-400/80 font-semibold">GRID: NCR-DELHI-UP // SECTOR 04</span>
          <span className="text-slate-400 hidden md:inline">•</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">ENCRYPTION: AES-256-GCM</span>
        </div>
      </div>

      {/* 2. Main Navigation & Ops Deck Controls */}
      <div className="h-14 px-4 flex items-center justify-between gap-3">
        {/* Left: Active Radar Ping & Operation Title */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Pulsating Radar Ping Widget */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xs bg-slate-100 dark:bg-[#040812] border border-cyan-600/40 dark:border-cyan-500/40 overflow-hidden shadow-xs" title="Live Tactical Radar">
            {/* Concentric rings */}
            <div className="absolute inset-1 rounded-full border border-cyan-600/20 dark:border-cyan-500/20" />
            <div className="absolute inset-2.5 rounded-full border border-cyan-600/30 dark:border-cyan-500/30" />
            {/* Pulsing beacon */}
            <div className="absolute w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-radar-ping" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-300 shadow-[0_0_8px_#00f0ff]" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-200 tracking-wider flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>SPECIAL CELL DELHI POLICE</span>
              </span>
              <Badge variant="cyan" className="text-[9px] px-1 py-0 h-4">
                NCR-09
              </Badge>
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 mt-0.5">
              <span>OP:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold tracking-wider">CHAKRAVYUH</span>
              <span className="text-slate-400">•</span>
              <span className="text-cyan-700 dark:text-cyan-300 font-semibold">UP STF GRID</span>
            </div>
          </div>
        </div>

        {/* Center: Live Ticking Dual Clocks & Backend Live Sync */}
        <div className="hidden xl:flex items-center space-x-4 px-3 py-1 rounded-xs bg-slate-100 dark:bg-[#040812]/80 border border-slate-300 dark:border-slate-800 text-[11px] font-mono tabular-nums shadow-xs">
          {/* Dual Timezone Clock */}
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
            <Clock className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="text-cyan-700 dark:text-cyan-300 font-bold">{utcTime || '00:00:00 UTC'}</span>
            <span className="text-slate-400">//</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">{istTime || '00:00:00 IST'}</span>
          </div>

          <div className="h-3 w-[1px] bg-slate-300 dark:bg-slate-800" />

          {/* Backend Live Sync Indicator */}
          <div className="flex items-center space-x-1.5">
            {backendStatus === 'online' ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-[0_0_8px_#00f59b]" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">LIVE BACKEND</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">({latencyMs || 24}ms)</span>
              </>
            ) : backendStatus === 'checking' ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                <span className="text-amber-700 dark:text-amber-400 text-[10px]">CONNECTING...</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400" />
                <span className="text-red-700 dark:text-red-400 text-[10px]">OFFLINE CACHE</span>
              </>
            )}
          </div>
        </div>

        {/* Global Omnisearch Bar */}
        <div className="relative w-full max-w-sm lg:max-w-md mx-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearchResults(true)
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search suspect, vehicle UP14, 98XXXXXX21, or city..."
              className="w-full rounded-xs border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#040812]/90 pl-8 pr-16 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-cyan-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-inner"
            />
            <div className="absolute right-2 top-2 flex items-center space-x-1">
              {searchQuery ? (
                <button 
                  onClick={() => { setSearchQuery(''); setShowSearchResults(false) }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-900">
                  CTRL+K
                </span>
              )}
            </div>
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchQuery.trim().length > 0 && (
            <div 
              className="absolute top-11 left-0 right-0 z-50 rounded-xs border border-slate-300 dark:border-cyan-500/30 bg-white dark:bg-[#090f1d] p-2 shadow-2xl font-mono text-xs backdrop-blur-xl"
              onMouseLeave={() => setShowSearchResults(false)}
            >
              {matchingEntities.length === 0 ? (
                <div className="p-3 text-center text-slate-500 dark:text-slate-400">
                  No matching target for "{searchQuery}".
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 px-2 py-1 uppercase tracking-wider font-semibold">
                    Matching Targets & Vehicles ({matchingEntities.length})
                  </div>
                  {matchingEntities.map((ent) => (
                    <div
                      key={ent.id}
                      onClick={() => handleSelectEntity(ent.id)}
                      className="flex items-center justify-between px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer rounded-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-cyan-700 dark:text-cyan-300 font-bold">{ent.name}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">({ent.city})</span>
                        </div>
                        <div className="flex items-center space-x-3 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {ent.phoneMasked && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5 text-slate-400" />
                              {ent.phoneMasked}
                            </span>
                          )}
                          {ent.vehicleNumber && (
                            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                              <Car className="h-2.5 w-2.5 text-amber-500 dark:text-amber-400" />
                              {ent.vehicleNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={ent.riskScore > 85 ? 'critical' : 'high'}>
                        RISK {ent.riskScore}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Controls: Alerts, Theme, Officer Dossier */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* Alerts Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative flex h-8 w-8 items-center justify-center rounded-xs border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#040812] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40 transition-colors shadow-xs"
              title="Threat Intercept Alerts"
            >
              <Bell className="h-4 w-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-mono font-bold text-white shadow-[0_0_8px_#ef4444]">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div 
                className="absolute right-0 top-10 z-50 w-88 rounded-xs border border-slate-300 dark:border-cyan-500/30 bg-white dark:bg-[#080e1c] shadow-2xl p-2 font-mono backdrop-blur-xl text-slate-900 dark:text-slate-100"
                onMouseLeave={() => setShowAlertsDropdown(false)}
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 px-2">
                  <div className="flex items-center space-x-1.5">
                    <ShieldAlert className="h-4 w-4 text-red-500 dark:text-red-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">Live Intercept Stream</span>
                  </div>
                  <Badge variant="critical">{unreadAlerts.length} Critical</Badge>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-64 overflow-y-auto">
                  {mockAlerts.map(alert => (
                    <div key={alert.id} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                        <span className="text-cyan-700 dark:text-cyan-400 font-semibold">{alert.source}</span>
                        <span className="tabular-nums">{alert.timestamp}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-0.5">{alert.title}</div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{alert.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-xs border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#040812] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40 transition-colors shadow-xs"
            title={`Switch to ${theme === 'dark' ? 'Tactical Light' : 'Tactical Dark'} Mode`}
            aria-label={`Toggle theme: current is ${theme}`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-cyan-700" />
            )}
          </button>

          {/* Officer Credentials Badge */}
          <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-300 dark:border-slate-800">
            <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-slate-100 dark:bg-[#040812] border border-cyan-600/40 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-400 font-mono text-[11px] font-bold shadow-xs">
              RS
            </div>
            <div className="text-left font-mono">
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">INSP R. K. SHARMA</div>
              <div className="text-[8.5px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 leading-none mt-0.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span>CLEARANCE LEVEL-4</span>
              </div>
            </div>
          </div>

          <Link to="/login">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30" title="Exit Terminal">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
