import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, TrendingUp, DollarSign, Check, Loader2, AlertCircle } from 'lucide-react'
import api from '../api/client'

interface CropRecommendation {
  crop_name: string
  expected_yield: string
  profit_estimate: string
  confidence_score: number
  reason: string
}

export default function CropRecommendation() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [farm, setFarm] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([])
  const [season, setSeason] = useState('Kharif')
  const [error, setError] = useState<string | null>(null)

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
      const response = await api.post('/crops/recommend', {
        soil_type: farm.soil_type || 'Black Soil',
        state: farm.location_state,
        district: farm.location_district,
        season: season,
        area_acres: farm.total_area_acres
      })
      setRecommendations(response.data)
    } catch (err: any) {
      console.error('Error getting recommendations:', err)
      setError('Could not get recommendations. Please try again.')
    } finally {
      setLoading(false)
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
        <h1 className="text-2xl font-bold text-white">Crop Recommendation</h1>
        <p className="text-gray-400 text-sm mt-1">
          AI-powered recommendations based on your farm profile
        </p>
      </div>

      {/* Farm Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Your Farm Details</h2>
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
            <p className="text-gray-500 text-xs">Location</p>
            <p className="text-white text-sm font-medium">{farm.location_district}, {farm.location_state}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Area</p>
            <p className="text-white text-sm font-medium">{farm.total_area_acres} acres</p>
          </div>
        </div>

        {/* Season Selector */}
        <div className="mt-4 flex items-center gap-4">
          <label className="text-gray-400 text-sm">Season:</label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-green-500"
          >
            <option value="Kharif">Kharif (June-October)</option>
            <option value="Rabi">Rabi (October-March)</option>
            <option value="Zaid">Zaid (March-June)</option>
          </select>
          <button
            onClick={getRecommendations}
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sprout className="w-4 h-4" />
                Get Recommendations
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((crop, index) => (
            <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">{crop.crop_name}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  crop.confidence_score > 80 ? 'bg-green-900/50 text-green-400' :
                  crop.confidence_score > 60 ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-red-900/50 text-red-400'
                }`}>
                  {crop.confidence_score}% Match
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">{crop.expected_yield}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">{crop.profit_estimate}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-400 mt-0.5" />
                  <span className="text-gray-400 text-xs">{crop.reason}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && !loading && !error && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Sprout className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-gray-400 text-sm">Click "Get Recommendations" to see AI-powered crop suggestions</h3>
          <p className="text-gray-600 text-xs mt-1">Based on your soil type, location, and selected season</p>
        </div>
      )}
    </div>
  )
}