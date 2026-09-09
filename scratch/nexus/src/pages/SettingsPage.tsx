import React, { useState } from 'react'
import { 
  Settings, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  Moon, 
  Sun, 
  FileLock2, 
  Terminal, 
  UserCheck, 
  Save, 
  RefreshCw,
  CheckCircle2,
  Lock
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  // AI Parameters State
  const [anomalyThreshold, setAnomalyThreshold] = useState(85)
  const [biometricThreshold, setBiometricThreshold] = useState(92)
  const [autoEdgeCreation, setAutoEdgeCreation] = useState(true)
  const [voiceprintClustering, setVoiceprintClustering] = useState(true)

  // Security credentials
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSaveSettings = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="space-y-6 font-mono max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100">
              TACTICAL SYSTEM CONFIGURATION
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            AI neural inference thresholds, security clearance parameters & CJIS audit compliance
          </p>
        </div>

        <Button
          variant="cyan"
          size="sm"
          onClick={handleSaveSettings}
          className="flex items-center space-x-1.5"
        >
          {savedSuccess ? <CheckCircle2 className="h-4 w-4 text-black" /> : <Save className="h-4 w-4" />}
          <span>{savedSuccess ? 'CONFIG PROPAGATED' : 'SAVE CONFIGURATION'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. AI Neural Inference Parameters */}
        <Card className="bg-[#0c121e] border-slate-800">
          <CardHeader className="p-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <CardTitle>AI Neural Pipeline Parameters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            {/* Anomaly threshold */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Financial Anomaly Trigger Threshold</span>
                <span className="text-cyan-400 font-bold">{anomalyThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={anomalyThreshold}
                onChange={(e) => setAnomalyThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Automated generation of FinCEN SAR alerts when transaction variance exceeds threshold.
              </p>
            </div>

            {/* Biometric threshold */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Biometric & Facial Match Confidence</span>
                <span className="text-emerald-400 font-bold">{biometricThreshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="99"
                value={biometricThreshold}
                onChange={(e) => setBiometricThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Minimum vector similarity required to issue automated border ANPR alerts.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-200 text-xs">Autonomous Graph Edge Creation</div>
                  <div className="text-[10px] text-slate-400">Automatically link entities discovered in intercepted communications</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoEdgeCreation}
                  onChange={(e) => setAutoEdgeCreation(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-200 text-xs">Voiceprint Neural Clustering</div>
                  <div className="text-[10px] text-slate-400">Cluster unlabelled burner phone audio by unique acoustic timbre</div>
                </div>
                <input
                  type="checkbox"
                  checked={voiceprintClustering}
                  onChange={(e) => setVoiceprintClustering(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 h-4 w-4"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 2. Visual & Display Preferences */}
        <Card className="bg-[#0c121e] border-slate-800">
          <CardHeader className="p-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <CardTitle>Interface & Tactical Aesthetics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
              <div>
                <div className="font-bold text-slate-200">Active Theme Palette</div>
                <div className="text-[10px] text-slate-400">
                  {theme === 'dark' ? 'Tactical Night Operations (Dark Mode)' : 'Analytical Day Operations (Light Mode)'}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center space-x-1.5"
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-cyan-400" />}
                <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
              </Button>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-300 font-bold">Data Density Mode</div>
              <p className="text-[10px] text-slate-400">
                Optimized for high-resolution command center displays (4K/QHD). Maximum rows per screen with tabular numbers.
              </p>
              <Badge variant="cyan">ULTRA-DENSE ACTIVE</Badge>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-300 font-bold">Classification Watermarking</div>
              <p className="text-[10px] text-slate-400">
                Persistent top and bottom security marking stamps on all exports and prints.
              </p>
              <Badge variant="emerald">TOP SECRET // SI // NOFORN</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 3. Officer Credentials & Session Profile */}
        <Card className="bg-[#0c121e] border-slate-800">
          <CardHeader className="p-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-cyan-400" />
              <CardTitle>Investigator Identity & Hardware Token</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block">Investigator:</span>
                <span className="text-slate-200 font-bold">Special Agent Sarah Vance</span>
              </div>
              <div>
                <span className="text-slate-400 block">Badge ID:</span>
                <span className="text-cyan-400 font-bold">FED-8491</span>
              </div>
              <div>
                <span className="text-slate-400 block">Agency Clearance:</span>
                <span className="text-emerald-400 font-bold">Level 5 Alpha</span>
              </div>
              <div>
                <span className="text-slate-400 block">FIDO2 Hardware Token:</span>
                <span className="text-slate-200 font-mono">Yubikey 5-NFC #48910</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Session Expiration:</span>
              <span className="text-amber-400 font-semibold">11h:42m remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. CJIS Compliance & Audit Logs */}
        <Card className="bg-[#0c121e] border-slate-800">
          <CardHeader className="p-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FileLock2 className="h-4 w-4 text-cyan-400" />
              <CardTitle>Immutable Chain of Custody Audit Log</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-[10px] text-slate-300">
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span>[2026-09-07 09:30 UTC] Query: Target Viktor Ramos dossier accessed</span>
              <span className="text-cyan-400 font-bold">LOGGED</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span>[2026-09-07 08:44 UTC] Export: Network graph JSON bundle exported</span>
              <span className="text-cyan-400 font-bold">LOGGED</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span>[2026-09-07 07:15 UTC] Upload: Evidence EV-8842-SIG registered</span>
              <span className="text-cyan-400 font-bold">HASHED</span>
            </div>
            <div className="pt-2 text-right">
              <span className="text-[9px] text-slate-400">All audit events cryptographically signed via SHA-256</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
