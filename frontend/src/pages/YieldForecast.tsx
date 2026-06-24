import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, BarChart, CheckCircle, AlertCircle,
  Leaf, Droplets, Sun, Cloud, Loader2, ArrowUp,
  ArrowDown, Minus, Calendar
} from 'lucide-react'
import api from '../api/client'

interface YieldFactor {
  name: string
  impact: string
  description: string
}

interface YieldForecast {
  crop_name: string
  predicted_yield: number
  yield_unit: string
  confidence_score: number
  min_yield: number
  max_yield: number
  factors: YieldFactor[]
  recommendations: string[]
  regional_average: number
  comparison: string
  generated_at: string
}

const CROP_OPTIONS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Chili', 'Soybean', 'Groundnut', 'Sunflower']
const IRRIGATION_OPTIONS = ['Drip', 'Sprinkler', 'Flood', 'Rainfed']
const SEASON_OPTIONS = ['Kharif', 'Rabi', 'Zaid']

export default function YieldForecast() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [farm, setFarm] = useState<any>(null)
  const [forecast, setForecast] = useState<YieldForecast | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    crop_type: 'Rice',
    irrigation_type: 'Drip',
    season: 'Kharif'
  })

  useEffect(() => {
    fetchFarm()
  }, [])

  const fetchFarm = async () => {
    try {
      const res = await api.get('/farm/my-farm')
      setFarm(res.data)
    } catch (err) {
      console.error('Error fetching farm:', err)
    }
  }

  const getForecast = async () => {
    if (!farm) {
      setError('Please create a farm profile first')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/yield/forecast', {
        crop_type: formData.crop_type,
        soil_type: farm.soil_type || 'Loamy Soil',
        area_acres: farm.total_area_acres,
        irrigation_type: formData.irrigation_type,
        season: formData.season,
        state: farm.location_state,
        district: farm.location_district
      })
      setForecast(response.data)
    } catch (err: any) {
      console.error('Error getting forecast:', err)
      setError('Could not generate yield forecast. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getComparisonIcon = (comparison: string) => {
    if (comparison.includes('Above')) return <ArrowUp className="w-5 h-5 text-green-400" />
    if (comparison.includes('Below')) return <ArrowDown className="w-5 h-5 text-red-400" />
    return <Minus className="w-5 h-5 text-yellow-400" />
  }

  const getComparisonColor = (comparison: string) => {
    if (comparison.includes('Above')) return 'text-green-400'
    if (comparison.includes('Below')) return 'text-red-400'
    return 'text-yellow-400'
  }

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'Positive': return 'text-green-400 bg-green-900/30 border-green-800'
      case 'Negative': return 'text-red-400 bg-red-900/30 border-red-800'
      default: return 'text-yellow-400 bg-yellow-900/30 border-yellow-800'
    }
  }

  if (!farm) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-yellow-400" />
        <p className="text-gray-400 text-sm">Please create a farm profile first</p>
        <button 
          onClick={() => navigate('/farm-profile')}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          Go to Farm Profile
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Yield Forecasting</h1>
        <p className="text-gray-400 text-sm mt-1">
          AI-powered yield prediction based on your farm data
        </p>
      </div>

      {/* Farm Info & Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Farm Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-gray-500 text-xs">Farm</p>
            <p className="text-white text-sm font-medium">{farm.farm_name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Soil Type</p>
            <p className="text-white text-sm font-medium">{farm.soil_type || 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Area</p>
            <p className="text-white text-sm font-medium">{farm.total_area_acres} acres</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Location</p>
            <p className="text-white text-sm font-medium">{farm.location_district}, {farm.location_state}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Crop Type
            </label>
            <select
              value={formData.crop_type}
              onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
            >
              {CROP_OPTIONS.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Irrigation Type
            </label>
            <select
              value={formData.irrigation_type}
              onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
            >
              {IRRIGATION_OPTIONS.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Season
            </label>
            <select
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
            >
              {SEASON_OPTIONS.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={getForecast}
          disabled={loading}
          className="mt-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Get Yield Forecast
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Forecast Results */}
      {forecast && (
        <div className="space-y-4">
          {/* Main Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Predicted Yield</p>
                <p className="text-white font-bold text-2xl">{forecast.predicted_yield}</p>
                <p className="text-gray-400 text-xs">{forecast.yield_unit}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Range</p>
                <p className="text-white font-semibold text-sm">
                  {forecast.min_yield} - {forecast.max_yield}
                </p>
                <p className="text-gray-400 text-xs">{forecast.yield_unit}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Confidence</p>
                <p className={`font-bold text-2xl ${
                  forecast.confidence_score >= 80 ? 'text-green-400' :
                  forecast.confidence_score >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {forecast.confidence_score}%
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">vs Regional Average</p>
                <div className="flex items-center justify-center gap-2">
                  {getComparisonIcon(forecast.comparison)}
                  <p className={`font-semibold text-sm ${getComparisonColor(forecast.comparison)}`}>
                    {forecast.comparison}
                  </p>
                </div>
                <p className="text-gray-400 text-xs">Regional: {forecast.regional_average} {forecast.yield_unit}</p>
              </div>
            </div>
          </div>

          {/* Factors */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-green-400" />
              Yield Factors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {forecast.factors.map((factor, i) => (
                <div key={i} className={`border rounded-lg p-4 ${getImpactColor(factor.impact)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{factor.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-black/30">
                      {factor.impact}
                    </span>
                  </div>
                  <p className="text-xs opacity-80">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {forecast.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                  <Leaf className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-xs">
              Generated: {new Date(forecast.generated_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}