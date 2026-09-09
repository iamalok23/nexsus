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

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Unauthenticated Login Portal */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Dashboard Shell Layout */}
          <Route path="/" element={<AppLayout />}>
            {/* 5 Main Hackathon Screens */}
            <Route index element={<DashboardPage />} />
            <Route path="upload" element={<UploadEvidencePage />} />
            <Route path="network" element={<NetworkAnalysisPage />} />
            <Route path="person/:id" element={<EntityProfilePage />} />
            <Route path="person" element={<EntityProfilePage />} />
            <Route path="evidence/:id" element={<EvidenceDetailsPage />} />
            <Route path="evidence" element={<EvidenceDetailsPage />} />

            {/* Aliases for backwards compatibility */}
            <Route path="entity/:id" element={<EntityProfilePage />} />
            <Route path="entity" element={<EntityProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
