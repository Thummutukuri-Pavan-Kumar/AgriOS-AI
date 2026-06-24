import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Droplets, Calendar, Clock, TrendingUp, Leaf, 
  Sun, Cloud, CloudRain, Wind, Loader2, AlertCircle,
  CheckCircle, BarChart
} from 'lucide-react'
import api from '../api/client'

interface IrrigationSchedule {
  day: number
  time: string
  duration_minutes: number
  water_amount_liters: number
  method: string
}

interface Recommendation {
  crop_name: string
  soil_type: string
  area_acres: number
  water_requirement: string
  weekly_schedule: IrrigationSchedule[]
  total_weekly_water: number
  savings_estimate: string
  tips: string[]
  generated_at: string
}

const WEATHER_OPTIONS = ['Normal', 'Sunny', 'Cloudy', 'Rainy', 'Hot', 'Humid']
const CROP_OPTIONS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Chili', 'Soybean', 'Groundnut', 'Sunflower']

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function Irrigation() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [farm, setFarm] = useState<any>(null)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    crop_type: 'Rice',
    weather_forecast: 'Normal'
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

  const getRecommendations = async () => {
    if (!farm) {
      setError('Please create a farm profile first')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/irrigation/recommend', {
        farm_id: farm.id,
        crop_type: formData.crop_type,
        soil_type: farm.soil_type || 'Loamy Soil',
        area_acres: farm.total_area_acres,
        weather_forecast: formData.weather_forecast
      })
      setRecommendation(response.data)
    } catch (err: any) {
      console.error('Error getting recommendations:', err)
      setError('Could not get irrigation recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (weather: string) => {
    switch(weather) {
      case 'Sunny': return <Sun className="w-5 h-5 text-yellow-400" />
      case 'Cloudy': return <Cloud className="w-5 h-5 text-gray-400" />
      case 'Rainy': return <CloudRain className="w-5 h-5 text-blue-400" />
      case 'Hot': return <Sun className="w-5 h-5 text-orange-400" />
      case 'Humid': return <Wind className="w-5 h-5 text-cyan-400" />
      default: return <Sun className="w-5 h-5 text-yellow-400" />
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
        <h1 className="text-2xl font-bold text-white">Smart Irrigation</h1>
        <p className="text-gray-400 text-sm mt-1">
          AI-powered irrigation scheduling to save water and optimize crop growth
        </p>
      </div>

      {/* Farm Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Farm Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Crop Type</label>
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
              <Sun className="w-4 h-4" />
              Weather Forecast
            </label>
            <select
              value={formData.weather_forecast}
              onChange={(e) => setFormData({ ...formData, weather_forecast: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500"
            >
              {WEATHER_OPTIONS.map(weather => (
                <option key={weather} value={weather}>{weather}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={getRecommendations}
          disabled={loading}
          className="mt-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Droplets className="w-4 h-4" />
              Get Irrigation Plan
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

      {/* Recommendation */}
      {recommendation && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Water Requirement</p>
                <p className="text-white font-semibold text-sm">{recommendation.water_requirement}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Weekly Water</p>
                <p className="text-white font-semibold text-sm">{recommendation.total_weekly_water.toFixed(1)} L</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Savings</p>
                <p className="text-green-400 font-semibold text-sm">{recommendation.savings_estimate}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs">Crop</p>
                <p className="text-white font-semibold text-sm">{recommendation.crop_name}</p>
              </div>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-400" />
              Weekly Irrigation Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {recommendation.weekly_schedule.map((schedule, i) => (
                <div 
                  key={i} 
                  className={`rounded-lg p-3 text-center ${
                    schedule.duration_minutes > 0 
                      ? 'bg-green-900/30 border border-green-800' 
                      : 'bg-gray-800/50 border border-gray-700'
                  }`}
                >
                  <p className="text-gray-400 text-xs">{DAYS[i]}</p>
                  {schedule.duration_minutes > 0 ? (
                    <>
                      <p className="text-white text-sm font-medium">{schedule.time}</p>
                      <p className="text-green-400 text-xs">{schedule.duration_minutes} min</p>
                      <p className="text-gray-500 text-xs">{schedule.water_amount_liters.toFixed(1)} L</p>
                    </>
                  ) : (
                    <p className="text-gray-500 text-xs">Rest Day</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Smart Irrigation Tips
            </h3>
            <div className="space-y-2">
              {recommendation.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                  <Leaf className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              Current Weather Impact
            </h3>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50">
              {getWeatherIcon(formData.weather_forecast)}
              <div>
                <p className="text-white text-sm font-medium">{formData.weather_forecast}</p>
                <p className="text-gray-400 text-xs">
                  {formData.weather_forecast === 'Rainy' ? 'Skip irrigation today! 🌧️' :
                   formData.weather_forecast === 'Hot' ? 'Water in early morning or evening 🌅' :
                   formData.weather_forecast === 'Sunny' ? 'Regular irrigation needed ☀️' :
                   'Normal irrigation schedule applied'}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-xs">
              Generated: {new Date(recommendation.generated_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}