import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Sprout, Droplets, TrendingUp, Activity, Sun, 
  Loader2, Leaf, ArrowRight, Award, Calendar,
  Shield, Sparkles, ChevronRight
} from 'lucide-react'
import api from '../api/client'

interface FarmData {
  id: number
  farm_name: string
  location_state: string
  location_district: string
  total_area_acres: number
  soil_type: string
  primary_crops: string[]
  water_source: string
  health_score: number
}

const modules = [
  { name: 'Crop Recommendation', path: '/crops', icon: '🌱', color: 'from-emerald-500/20 to-emerald-600/10', emoji: '🌾' },
  { name: 'Disease Detection', path: '/disease', icon: '🔬', color: 'from-red-500/20 to-red-600/10', emoji: '🦠' },
  { name: 'Smart Irrigation', path: '/irrigation', icon: '💧', color: 'from-blue-500/20 to-blue-600/10', emoji: '🌊' },
  { name: 'Yield Forecasting', path: '/yield', icon: '📊', color: 'from-purple-500/20 to-purple-600/10', emoji: '📈' },
  { name: 'Profit Forecasting', path: '/profit', icon: '💰', color: 'from-green-500/20 to-green-600/10', emoji: '💵' },
  { name: 'Market Intelligence', path: '/market', icon: '🏪', color: 'from-yellow-500/20 to-yellow-600/10', emoji: '📊' },
  { name: 'Govt Schemes', path: '/schemes', icon: '📋', color: 'from-orange-500/20 to-orange-600/10', emoji: '🏛️' },
  { name: 'AI Copilot', path: '/copilot', icon: '🤖', color: 'from-indigo-500/20 to-indigo-600/10', emoji: '💡' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [farm, setFarm] = useState<FarmData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchFarmData()
  }, [navigate])

  const fetchFarmData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/farm/my-farm')
      console.log('Farm data:', res.data)
      setFarm(res.data)
    } catch (err: any) {
      console.error('Error fetching farm:', err)
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token')
        navigate('/login')
        return
      } else if (err.response?.status === 404) {
        setFarm(null)
      } else {
        setError('Could not load farm data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getHealthScoreEmoji = (score: number) => {
    if (score >= 80) return '🌟'
    if (score >= 60) return '👍'
    if (score >= 40) return '⚠️'
    return '🔴'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          <Leaf className="w-6 h-6 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Loading your farm...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header with Animation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-800/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🌾</span>
              {farm ? `Welcome to ${farm.farm_name}` : 'Welcome to AgriOS AI'}
            </h1>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {farm 
                ? `Your farm intelligence overview — ${farm.location_district}, ${farm.location_state}` 
                : 'Create your farm profile to get started'}
            </p>
          </div>
          {farm && (
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getHealthScoreEmoji(farm.health_score)}</span>
                <span className={`text-3xl font-bold ${getHealthScoreColor(farm.health_score)}`}>
                  {farm.health_score}%
                </span>
              </div>
              <p className="text-gray-500 text-xs">Farm Health Score</p>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Stats Cards with Animations */}
      {farm ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all group">
            <p className="text-gray-500 text-xs">Health Score</p>
            <p className={`text-xl font-bold ${getHealthScoreColor(farm.health_score)} group-hover:scale-105 transition-transform`}>
              {farm.health_score}%
            </p>
            <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  farm.health_score >= 80 ? 'bg-green-400' :
                  farm.health_score >= 60 ? 'bg-yellow-400' :
                  farm.health_score >= 40 ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${farm.health_score}%` }}
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs">Crops</p>
            <p className="text-xl font-bold text-white">{farm.primary_crops?.length || 0}</p>
            <p className="text-gray-500 text-xs truncate">{farm.primary_crops?.join(', ') || 'None'}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs">Area</p>
            <p className="text-xl font-bold text-white">{farm.total_area_acres}</p>
            <p className="text-gray-500 text-xs">acres</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs">Soil</p>
            <p className="text-sm font-medium text-white truncate">{farm.soil_type || 'Not set'}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs">Irrigation</p>
            <p className="text-sm font-medium text-white truncate">{farm.water_source || 'Not set'}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs">Location</p>
            <p className="text-sm font-medium text-white truncate">{farm.location_district}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800/30 rounded-xl p-8 text-center">
          <Leaf className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-white font-semibold text-lg">Set Up Your Farm</h3>
          <p className="text-gray-400 text-sm mb-4">Create your farm profile to unlock all features</p>
          <button 
            onClick={() => navigate('/farm-profile')}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg text-sm transition-all hover:scale-105 flex items-center gap-2 mx-auto"
          >
            Create Farm Profile
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modules Grid with Icons */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800/30 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-green-400" />
            Platform Modules
          </h2>
          <span className="text-gray-500 text-xs">{modules.length} modules</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {modules.map((module) => (
            <div 
              key={module.name}
              onClick={() => navigate(module.path)}
              className={`bg-gradient-to-br ${module.color} rounded-xl p-4 text-center border border-gray-700 hover:border-green-500 hover:scale-105 transition-all duration-300 cursor-pointer group`}
            >
              <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{module.icon}</div>
              <p className="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">
                {module.name}
              </p>
              <div className="flex items-center justify-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-green-400">Open</span>
                <ChevronRight className="w-3 h-3 text-green-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Footer */}
      {farm && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs">🌾 Total Crops</p>
            <p className="text-white font-semibold">{farm.primary_crops?.length || 0}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs">💧 Water Source</p>
            <p className="text-white font-semibold text-sm">{farm.water_source || 'N/A'}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs">📍 State</p>
            <p className="text-white font-semibold text-sm">{farm.location_state}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs">📅 Updated</p>
            <p className="text-white font-semibold text-sm">Today</p>
          </div>
        </div>
      )}
    </div>
  )
}