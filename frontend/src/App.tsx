

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './context/LanguageContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import FarmProfile from './pages/FarmProfile'
import Copilot from './pages/Copilot'
import CropRecommendation from './pages/CropRecommendation'
import DiseaseDetection from './pages/DiseaseDetection'
import Irrigation from './pages/Irrigation'
import YieldForecast from './pages/YieldForecast'
import ProfitForecast from './pages/ProfitForecast'
import MarketIntelligence from './pages/MarketIntelligence'
import Schemes from './pages/Schemes'
import Alerts from './pages/Alerts'
import Layout from './components/layout/Layout'

const queryClient = new QueryClient()

const isAuthenticated = () => !!localStorage.getItem('access_token')

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="farm-profile" element={<FarmProfile />} />
            <Route path="copilot" element={<Copilot />} />
            <Route path="crops" element={<CropRecommendation />} />
            <Route path="disease" element={<DiseaseDetection />} />
            <Route path="irrigation" element={<Irrigation />} />
            <Route path="yield" element={<YieldForecast />} />
            <Route path="profit" element={<ProfitForecast />} />
            <Route path="market" element={<MarketIntelligence />} />
            <Route path="schemes" element={<Schemes />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>
        </Routes>
      </LanguageProvider>
    </QueryClientProvider>
  )
}