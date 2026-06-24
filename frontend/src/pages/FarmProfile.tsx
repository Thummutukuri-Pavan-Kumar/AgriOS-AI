
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, User, MapPin, Sprout, Droplets, Ruler, Loader2, AlertCircle } from 'lucide-react'
import api from '../api/client'

interface FarmData {
  id?: number
  farm_name: string
  location_state: string
  location_district: string
  total_area_acres: number
  soil_type: string
  primary_crops: string[]
  water_source: string
  health_score: number
}

const SOIL_TYPES = ['Black Soil', 'Red Soil', 'Alluvial Soil', 'Laterite Soil', 'Sandy Soil', 'Clay Soil', 'Loamy Soil']
const WATER_SOURCES = ['Borewell', 'Canal', 'Rainwater', 'Pond', 'River', 'Drip Irrigation']
const CROP_OPTIONS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Chili', 'Soybean', 'Groundnut', 'Sunflower']

export default function FarmProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [farm, setFarm] = useState<FarmData>({
    farm_name: '',
    location_state: '',
    location_district: '',
    total_area_acres: 0,
    soil_type: '',
    primary_crops: [],
    water_source: '',
    health_score: 0
  })

  useEffect(() => {
    fetchFarm()
  }, [])

  const fetchFarm = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/farm/my-farm')
      console.log('Farm data fetched:', res.data)
      setFarm(res.data)
    } catch (err: any) {
      console.error('Error fetching farm:', err)
      if (err.response?.status === 404) {
        // No farm yet, that's fine
        console.log('No farm found, ready to create one')
      } else if (err.response?.status === 401) {
        localStorage.removeItem('access_token')
        navigate('/login')
      } else {
        setError('Could not load farm data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    // Validate
    if (!farm.farm_name.trim()) {
      setError('Please enter a farm name')
      setSaving(false)
      return
    }
    if (!farm.location_state.trim()) {
      setError('Please enter your state')
      setSaving(false)
      return
    }
    if (!farm.location_district.trim()) {
      setError('Please enter your district')
      setSaving(false)
      return
    }
    if (farm.total_area_acres <= 0) {
      setError('Please enter a valid farm area')
      setSaving(false)
      return
    }

    try {
      const payload = {
        farm_name: farm.farm_name,
        location_state: farm.location_state,
        location_district: farm.location_district,
        total_area_acres: farm.total_area_acres,
        soil_type: farm.soil_type || undefined,
        primary_crops: farm.primary_crops,
        water_source: farm.water_source || undefined
      }

      console.log('Saving farm data:', payload)

      let response
      if (farm.id) {
        // Update existing farm
        response = await api.put('/farm/update', payload)
        console.log('Update response:', response.data)
      } else {
        // Create new farm
        response = await api.post('/farm/create', payload)
        console.log('Create response:', response.data)
      }

      setSuccess(farm.id ? 'Farm updated successfully! 🌾' : 'Farm created successfully! 🎉')
      
      // Refresh farm data
      setTimeout(() => {
        fetchFarm()
        setSuccess(null)
      }, 2000)

    } catch (err: any) {
      console.error('Error saving farm:', err)
      console.error('Error response:', err.response?.data)
      
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token')
        navigate('/login')
        setError('Session expired. Please login again.')
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Error saving farm. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleCrop = (crop: string) => {
    setFarm(prev => ({
      ...prev,
      primary_crops: prev.primary_crops.includes(crop)
        ? prev.primary_crops.filter(c => c !== crop)
        : [...prev.primary_crops, crop]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Farm Profile</h1>
          <p className="text-gray-400 text-sm mt-1">
            {farm.id ? 'Manage your farm details' : 'Register your farm to get started'}
          </p>
        </div>
        {farm.id && (
          <div className="bg-green-900/30 border border-green-800 rounded-lg px-4 py-2">
            <span className="text-green-400 text-sm font-medium">
              Health Score: {farm.health_score}%
            </span>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-800 text-green-400 text-sm px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Main Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Farm Name */}
          <div className="col-span-2">
            <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-2">
              <User className="w-4 h-4" />
              Farm Name
            </label>
            <input
              value={farm.farm_name}
              onChange={e => setFarm({ ...farm, farm_name: e.target.value })}
              placeholder="e.g., Green Valley Farm"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* State */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              State
            </label>
            <input
              value={farm.location_state}
              onChange={e => setFarm({ ...farm, location_state: e.target.value })}
              placeholder="e.g., Karnataka"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* District */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">District</label>
            <input
              value={farm.location_district}
              onChange={e => setFarm({ ...farm, location_district: e.target.value })}
              placeholder="e.g., Mandya"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Area */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Total Area (Acres)
            </label>
            <input
              type="number"
              value={farm.total_area_acres || ''}
              onChange={e => setFarm({ ...farm, total_area_acres: parseFloat(e.target.value) || 0 })}
              placeholder="e.g., 5"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Soil Type */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-2">
              <Sprout className="w-4 h-4" />
              Soil Type
            </label>
            <select
              value={farm.soil_type}
              onChange={e => setFarm({ ...farm, soil_type: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500 transition-colors"
            >
              <option value="">Select soil type</option>
              {SOIL_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Water Source */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Water Source
            </label>
            <select
              value={farm.water_source}
              onChange={e => setFarm({ ...farm, water_source: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-green-500 transition-colors"
            >
              <option value="">Select water source</option>
              {WATER_SOURCES.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          {/* Primary Crops */}
          <div className="col-span-2">
            <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
              <Sprout className="w-4 h-4" />
              Primary Crops (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {CROP_OPTIONS.map(crop => (
                <button
                  key={crop}
                  onClick={() => toggleCrop(crop)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    farm.primary_crops.includes(crop)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t border-gray-800 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {farm.id ? 'Update Farm' : 'Create Farm'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}