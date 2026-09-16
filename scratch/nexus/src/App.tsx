import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { UploadEvidencePage } from './pages/UploadEvidencePage'
import { NetworkAnalysisPage } from './pages/NetworkAnalysisPage'
import { EntityProfilePage } from './pages/EntityProfilePage'
import { EvidenceDetailsPage } from './pages/EvidenceDetailsPage'
import { CasesPage } from './pages/CasesPage'
import { TimelinePage } from './pages/TimelinePage'
import { SettingsPage } from './pages/SettingsPage'

import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Unauthenticated Login Portal */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated Dashboard Shell Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/cases" element={<CasesPage />} />
                <Route path="/upload" element={<UploadEvidencePage />} />
                <Route path="/network" element={<NetworkAnalysisPage />} />
                <Route path="/person/:id" element={<EntityProfilePage />} />
                <Route path="/person" element={<EntityProfilePage />} />
                <Route path="/evidence/:id" element={<EvidenceDetailsPage />} />
                <Route path="/evidence" element={<EvidenceDetailsPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Aliases for backwards compatibility */}
                <Route path="/entity/:id" element={<EntityProfilePage />} />
                <Route path="/entity" element={<EntityProfilePage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
