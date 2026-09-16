import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield } from 'lucide-react'

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060a12] text-slate-100 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center space-y-4 p-6 border border-slate-800 bg-[#0c1322] rounded shadow-2xl">
          <div className="relative flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <Shield className="h-5 w-5 text-cyan-400 absolute" />
          </div>
          <div className="text-center space-y-1">
            <div className="text-xs font-bold tracking-widest text-cyan-400 animate-pulse uppercase">
              SECURITY VERIFICATION
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider">
              Validating Officer Credentials & Session Token...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
