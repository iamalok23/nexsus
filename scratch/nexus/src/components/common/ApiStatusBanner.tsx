import React from 'react'
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'

interface ApiStatusBannerProps {
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  label?: string
}

export const ApiStatusBanner: React.FC<ApiStatusBannerProps> = ({
  loading,
  error,
  onRetry,
  label = 'BACKEND API',
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
          <span>{label} // Fetching live data from http://localhost:8000...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded bg-amber-950/40 border border-amber-500/50 text-amber-300 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-amber-200">BACKEND DISCONNECTED: </span>
            <span className="text-amber-300/90">{error}</span>
            <span className="text-slate-400 ml-1">(Displaying synthetic baseline fallback)</span>
          </div>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-6 px-2 text-[10px] border-amber-500/40 text-amber-300 hover:bg-amber-950/60 flex items-center space-x-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-3 py-1 rounded bg-slate-900/60 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
      <div className="flex items-center space-x-2">
        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
        <span>LIVE BACKEND SYNCED // http://localhost:8000 (Synthetic Investigation Dataset)</span>
      </div>
    </div>
  )
}
