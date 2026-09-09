import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  Shield,
  Fingerprint
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [badgeId, setBadgeId] = useState('DL-SPL-4412')
  const [pin, setPin] = useState('••••••••')
  const [division, setDivision] = useState('SPL_CELL')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authStatus, setAuthStatus] = useState<string | null>(null)

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsAuthenticating(true)
    setAuthStatus('VERIFYING OFFICER CREDENTIALS...')

    setTimeout(() => {
      setAuthStatus('CREDENTIALS VERIFIED: ACCESS GRANTED')
      setTimeout(() => {
        navigate('/')
      }, 400)
    }, 600)
  }

  const handleQuickLogin = (role: 'inspector' | 'analyst') => {
    if (role === 'inspector') {
      setBadgeId('DL-SPL-4412')
      setDivision('SPL_CELL')
    } else {
      setBadgeId('UP-STF-9910')
      setDivision('UP_STF')
    }
    handleLogin()
  }

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col justify-between tactical-grid font-mono relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-30" />

      {/* Top Header */}
      <div className="border-b border-amber-900/60 bg-amber-950/40 py-1.5 px-4 text-center text-[10px] font-bold tracking-widest text-amber-400 select-none">
        SMART INDIA HACKATHON 2026 • SPECIAL CELL DELHI POLICE & UP STF CRIME NETWORK PROTOTYPE
      </div>

      {/* Main Authentication Center */}
      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md border border-slate-800 bg-[#0c1322]/90 rounded-sm shadow-2xl p-6 md:p-8 backdrop-blur-xl relative">
          {/* Glowing Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

          {/* Logo & Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xs bg-cyan-950/80 border border-cyan-500/60 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <Shield className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-widest text-cyan-400">NEXUS</h1>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">
                AI Criminal Network Analysis System
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-1">
              <Badge variant="cyan" className="text-[9px]">SIH 2026 PROTOTYPE</Badge>
              <Badge variant="emerald" className="text-[9px]">ACTIVE GRID</Badge>
            </div>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Officer / Investigator Badge ID
              </label>
              <div className="relative">
                <Input
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="e.g. DL-SPL-4412"
                  required
                  className="bg-slate-900 border-slate-700 text-slate-100 uppercase"
                />
                <ShieldCheck className="absolute right-3 top-2.5 h-4 w-4 text-emerald-400" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Security PIN / Passcode
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter security pin"
                  required
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Police Department / Unit
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full rounded-sm border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="SPL_CELL">Special Cell (Delhi Police)</option>
                <option value="UP_STF">Uttar Pradesh Special Task Force (UP STF)</option>
                <option value="ED">Enforcement Directorate (ED - Cyber/Hawala)</option>
                <option value="CBI">Central Bureau of Investigation (CBI)</option>
              </select>
            </div>

            {authStatus && (
              <div className="p-2.5 rounded-xs bg-cyan-950/60 border border-cyan-500/50 text-[10px] text-cyan-300 text-center animate-pulse">
                {authStatus}
              </div>
            )}

            <Button
              type="submit"
              variant="cyan"
              disabled={isAuthenticating}
              className="w-full h-10 text-xs font-bold flex items-center justify-center space-x-2"
            >
              <span>{isAuthenticating ? 'AUTHENTICATING...' : 'ENTER INVESTIGATION GRID'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Demo Access Triggers */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center space-y-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Quick Presentation Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('inspector')}
                className="text-[10px] h-8 truncate"
              >
                Sub-Insp R. K. Sharma
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('analyst')}
                className="text-[10px] h-8 truncate"
              >
                UP STF Analyst
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="border-t border-slate-800 bg-[#040810] py-2 px-4 text-center text-[10px] text-slate-400">
        Smart India Hackathon 2026 Prototype • Operation Chakravyuh Intelligence Grid
      </div>
    </div>
  )
}
