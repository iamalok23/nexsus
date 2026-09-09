import React, { useState } from 'react'
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
  Phone
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { mockAlerts, mockEntities, mockCases } from '../../data/mockData'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export const TopNav: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false)

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
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-slate-800 bg-[#090e18]/90 dark:bg-[#090e18]/90 light:bg-slate-900 px-4 backdrop-blur-md">
      {/* Agency Header left */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-[10px] font-mono font-semibold text-slate-300">
          <Shield className="h-3.5 w-3.5 text-cyan-400" />
          <span>SPECIAL CELL // DELHI POLICE</span>
        </div>
        <div className="text-[11px] font-mono text-cyan-400 tracking-wider hidden md:block">
          <span className="text-slate-400">OPERATION:</span> <span className="text-emerald-400 font-bold">CHAKRAVYUH</span>
        </div>
      </div>

      {/* Global Omnisearch Bar */}
      <div className="relative w-full max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSearchResults(true)
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search Rahul Verma, UP14 AB 1234, 98XXXXXX21, Ghaziabad..."
            className="w-full rounded-sm border border-slate-700 bg-slate-900/90 pl-9 pr-8 py-1.5 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setShowSearchResults(false) }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Search Autocomplete Results Dropdown */}
        {showSearchResults && searchQuery.trim().length > 0 && (
          <div 
            className="absolute top-11 left-0 right-0 z-50 rounded-sm border border-slate-700 bg-[#0c121e] p-2 shadow-2xl font-mono text-xs"
            onMouseLeave={() => setShowSearchResults(false)}
          >
            {matchingEntities.length === 0 ? (
              <div className="p-3 text-center text-slate-400">
                No matching target found for "{searchQuery}".
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                <div className="py-1">
                  <div className="text-[10px] text-slate-400 px-2 py-1 uppercase tracking-wider font-semibold">
                    Matching Suspects & Vehicles ({matchingEntities.length})
                  </div>
                  {matchingEntities.map((ent) => (
                    <div
                      key={ent.id}
                      onClick={() => handleSelectEntity(ent.id)}
                      className="flex items-center justify-between px-2 py-2 hover:bg-slate-800/80 cursor-pointer rounded-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-cyan-300 font-bold">{ent.name}</span>
                          <span className="text-[10px] text-slate-400">({ent.city})</span>
                        </div>
                        <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-0.5">
                          {ent.phoneMasked && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5 text-slate-400" />
                              {ent.phoneMasked}
                            </span>
                          )}
                          {ent.vehicleNumber && (
                            <span className="flex items-center gap-1 text-amber-300">
                              <Car className="h-2.5 w-2.5 text-amber-400" />
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Alerts, Theme, Profile */}
      <div className="flex items-center space-x-2.5">
        {/* Threat Alerts Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative flex h-8 w-8 items-center justify-center rounded-xs border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            title="Threat Alerts Feed"
          >
            <Bell className="h-4 w-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-mono font-bold text-white shadow-threat">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div 
              className="absolute right-0 top-10 z-50 w-84 rounded-sm border border-slate-700 bg-[#0c121e] shadow-2xl p-2 font-mono"
              onMouseLeave={() => setShowAlertsDropdown(false)}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-2">
                <div className="flex items-center space-x-1.5">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase">Live Intercept Alerts</span>
                </div>
                <Badge variant="critical">{unreadAlerts.length} Critical</Badge>
              </div>
              <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
                {mockAlerts.map(alert => (
                  <div key={alert.id} className="p-2 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="text-cyan-400 font-semibold">{alert.source}</span>
                      <span>{alert.timestamp}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-100 mb-1">{alert.title}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-xs border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Tactical Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-400" />}
        </button>

        {/* Indian Officer Credentials */}
        <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-slate-800 border border-slate-700 text-cyan-400 font-mono text-xs font-bold">
            RS
          </div>
          <div className="text-left font-mono">
            <div className="text-[11px] font-bold text-slate-200 leading-tight">INSP R. K. SHARMA</div>
            <div className="text-[9px] text-slate-400 leading-none">BADGE #DL-4412</div>
          </div>
        </div>

        <Link to="/login">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-400 hover:text-red-400" title="Exit">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
